from flask import Flask, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
import re
from sqlalchemy import func
from datetime import datetime
import pandas as pd
from fpdf import FPDF
from io import BytesIO

app = Flask(__name__)
CORS(app)

# Caminho do banco de dados SQLite
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'sistemaComercial.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Modelos
class Cliente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    telefone = db.Column(db.String(20))

class Produto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    preco = db.Column(db.Float, nullable=False)
    estoque = db.Column(db.Integer, default=0)

class Compra(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('cliente.id'))
    produto_id = db.Column(db.Integer, db.ForeignKey('produto.id'))
    quantidade = db.Column(db.Integer, nullable=False)
    total = db.Column(db.Float, nullable=False)
    data = db.Column(db.DateTime, default=datetime.utcnow)

    cliente = db.relationship('Cliente', backref=db.backref('compras', lazy=True))
    produto = db.relationship('Produto', backref=db.backref('compras', lazy=True))

# Criação das tabelas dentro do contexto da aplicação
with app.app_context():
    db.create_all()

# Rotas
@app.route('/')
def index():
    return 'API do Sistema Comercial funcionando!'

# CRUD Cliente
@app.route('/clientes', methods=['GET'])
def listar_clientes():
    clientes = Cliente.query.all()
    return jsonify([{'id': c.id, 'nome': c.nome, 'email': c.email, 'telefone': c.telefone} for c in clientes])

@app.route('/clientes', methods=['POST'])
def criar_cliente():
    data = request.json
    nome = data.get('nome')
    email = data.get('email')
    telefone = data.get('telefone', '')

    # Validação simples de email
    if not nome or not email:
        return jsonify({'erro': 'Nome e email são obrigatórios'}), 400

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({'erro': 'Email inválido'}), 400

    novo = Cliente(nome=nome, email=email, telefone=telefone)
    db.session.add(novo)
    db.session.commit()

    return jsonify({
        'id': novo.id,
        'nome': novo.nome,
        'email': novo.email,
        'telefone': novo.telefone
    }), 201

@app.route('/clientes/<int:id>', methods=['PUT'])
def atualizar_cliente(id):
    cliente = Cliente.query.get(id)
    if not cliente:
        return jsonify({'erro': 'Cliente não encontrado'}), 404

    data = request.json
    cliente.nome = data.get('nome', cliente.nome)
    cliente.email = data.get('email', cliente.email)
    cliente.telefone = data.get('telefone', cliente.telefone)

    db.session.commit()
    return jsonify({
        'id': cliente.id,
        'nome': cliente.nome,
        'email': cliente.email,
        'telefone': cliente.telefone
    })

@app.route('/clientes/<int:id>', methods=['DELETE'])
def excluir_cliente(id):
    cliente = Cliente.query.get(id)
    if not cliente:
        return jsonify({'erro': 'Cliente não encontrado'}), 404

    db.session.delete(cliente)
    db.session.commit()
    return jsonify({'mensagem': 'Cliente excluído com sucesso'})

# CRUD Produto
@app.route('/produtos', methods=['GET'])
def listar_produtos():
    produtos = Produto.query.all()
    return jsonify([{'id': p.id, 'nome': p.nome, 'preco': p.preco, 'estoque': p.estoque} for p in produtos])

@app.route('/produtos', methods=['POST'])
def criar_produto():
    data = request.json
    nome = data.get('nome')
    preco = data.get('preco')
    estoque = data.get('estoque')

    #Validação
    if not nome or not preco or not estoque:
        return jsonify({"error": "Dados incompletos"}), 400

    novo_produto = Produto(nome=nome, preco=preco, estoque=estoque)
    db.session.add(novo_produto)
    db.session.commit()

    return jsonify({
        'id': novo_produto.id,
        'nome': novo_produto.nome,
        'preco': novo_produto.email,
        'estoque': novo_produto.telefone
    }), 201

@app.route('/produtos/<int:id>', methods=['PUT'])
def atualizar_produto(id):
    produto = Produto.query.get(id)
    if not produto:
        return jsonify({'erro': 'Produto não encontrado'}), 404

    data = request.json
    produto.nome = data.get('nome', produto.nome)
    produto.preco = data.get('preco', produto.preco)
    produto.estoque = data.get('estoque', produto.estoque)

    db.session.commit()
    return jsonify({
        'id': produto.id,
        'nome': produto.nome,
        'preco': produto.preco,
        'estoque': produto.estoque
    })

@app.route('/produtos/<int:id>', methods=['DELETE'])
def excluir_produtos(id):
    produto = Produto.query.get(id)
    if not produto:
        return jsonify({'erro': 'Produto não encontrado'}), 404

    db.session.delete(produto)
    db.session.commit()
    return jsonify({'mensagem': 'Produto excluído com sucesso'})


# Rotas Compra
@app.route('/compras', methods=['POST'])
def criar_compra():
    data = request.json
    cliente = Cliente.query.get_or_404(data['cliente_id'])
    produtos_ids = data['produtos']  # Lista de produtos comprados

    total = 0
    estoque_insuficiente = []

    # Primeiro, verificar se há estoque suficiente para todos os produtos
    for produto_data in produtos_ids:
        produto = Produto.query.get_or_404(produto_data['produto_id'])
        quantidade = produto_data['quantidade']

        if produto.estoque < quantidade:
            estoque_insuficiente.append(f"{produto.nome} (Disponível: {produto.estoque})")

    if estoque_insuficiente:
        return jsonify({'erro': f'Estoque insuficiente para: {", ".join(estoque_insuficiente)}'}), 400

    # Criar um único ID de compra
    nova_compra = Compra(cliente_id=cliente.id, total=0)  # Total atualizado depois
    db.session.add(nova_compra)
    db.session.commit()  # Salva para obter o ID

    # Agora, associamos os produtos à compra
    for produto_data in produtos_ids:
        produto = Produto.query.get(produto_data['produto_id'])
        quantidade = produto_data['quantidade']

        total += produto.preco * quantidade
        produto.estoque -= quantidade  # Atualiza estoque

        # Relação entre produto e compra
        db.session.add(Compra(cliente_id=cliente.id, produto_id=produto.id, quantidade=quantidade, total=produto.preco * quantidade))

    # Atualiza o total na compra
    nova_compra.total = total
    db.session.commit()

    return jsonify({'mensagem': 'Compra registrada com sucesso', 'total': total, 'compra_id': nova_compra.id}), 201


@app.route('/compras', methods=['GET'])
def listar_compras():
    compras = Compra.query.all()
    return jsonify([{
        'cliente': compra.cliente.nome,
        'produto': compra.produto.nome,
        'quantidade': compra.quantidade,
        'total': compra.total,
        'data': compra.data
    } for compra in compras])

# Relatório de vendas por produto
@app.route('/vendas/produto', methods=['GET'])
def vendas_por_produto():
    vendas = db.session.query(Produto.nome, func.sum(Compra.quantidade).label('quantidade_vendida')).join(Compra).group_by(Produto.id).all()
    return jsonify([{'produto': venda.nome, 'quantidade_vendida': venda.quantidade_vendida} for venda in vendas])

# Relatório de vendas por cliente
@app.route('/vendas/cliente', methods=['GET'])
def vendas_por_cliente():
    vendas = db.session.query(Cliente.nome, func.sum(Compra.total).label('total_compras')).join(Compra).group_by(Cliente.id).all()
    return jsonify([{'cliente': venda.nome, 'total_compras': venda.total_compras} for venda in vendas])

# Exportação para Excel
@app.route('/exportar/compras/excel', methods=['GET'])
def exportar_compras_excel():
    compras = Compra.query.all()
    dados = [{
        'Cliente': compra.cliente.nome,
        'Produto': compra.produto.nome,
        'Quantidade': compra.quantidade,
        'Total': compra.total,
        'Data': compra.data.strftime('%d/%m/%Y')
    } for compra in compras]
    
    df = pd.DataFrame(dados)
    excel_io = BytesIO()
    with pd.ExcelWriter(excel_io, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False)
    excel_io.seek(0)
    
    return send_file(excel_io, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', as_attachment=True, attachment_filename='compras.xlsx')

# Exportação para PDF
@app.route('/exportar/compras/pdf', methods=['GET'])
def exportar_compras_pdf():
    compras = Compra.query.all()
    
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(200, 10, 'Relatório de Compras', ln=True, align='C')
    
    pdf.ln(10)  # Linha em branco
    
    for compra in compras:
        pdf.cell(200, 10, f"Cliente: {compra.cliente.nome} - Produto: {compra.produto.nome} - Quantidade: {compra.quantidade} - Total: {compra.total} - Data: {compra.data.strftime('%d/%m/%Y')}", ln=True)
    
    pdf_output = BytesIO()
    pdf.output(pdf_output)
    pdf_output.seek(0)
    
    return send_file(pdf_output, mimetype='application/pdf', as_attachment=True, attachment_filename='compras.pdf')

if __name__ == '__main__':
    app.run(debug=True)