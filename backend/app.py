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

# Caminho do banco SQLite
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'sistemaComercial.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ---------- MODELOS ----------
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
    cliente_id = db.Column(db.Integer, db.ForeignKey('cliente.id'), nullable=False)
    total = db.Column(db.Float, nullable=False)
    data = db.Column(db.DateTime, default=datetime.utcnow)

    cliente = db.relationship('Cliente', backref=db.backref('compras', lazy=True))

class ItemCompra(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    compra_id = db.Column(db.Integer, db.ForeignKey('compra.id'))
    produto_id = db.Column(db.Integer, db.ForeignKey('produto.id'))
    quantidade = db.Column(db.Integer, nullable=False)
    total = db.Column(db.Float, nullable=False)

    compra = db.relationship('Compra', backref=db.backref('itens', lazy=True))
    produto = db.relationship('Produto')

# Criar as tabelas
with app.app_context():
    db.create_all()

# ---------- ROTAS ----------
@app.route('/')
def index():
    return 'API do Sistema Comercial funcionando!'

# ---------- CLIENTES ---------- 
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

    if not nome or not email or not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({'erro': 'Nome e email válidos são obrigatórios'}), 400

    cliente = Cliente(nome=nome, email=email, telefone=telefone)
    db.session.add(cliente)
    db.session.commit()

    return jsonify({'id': cliente.id, 'nome': cliente.nome, 'email': cliente.email, 'telefone': cliente.telefone}), 201

@app.route('/clientes/<int:id>', methods=['PUT'])
def atualizar_cliente(id):
    cliente = Cliente.query.get_or_404(id)
    data = request.json
    cliente.nome = data.get('nome', cliente.nome)
    cliente.email = data.get('email', cliente.email)
    cliente.telefone = data.get('telefone', cliente.telefone)
    db.session.commit()
    return jsonify({'id': cliente.id, 'nome': cliente.nome, 'email': cliente.email, 'telefone': cliente.telefone})

@app.route('/clientes/<int:id>', methods=['DELETE'])
def excluir_cliente(id):
    cliente = Cliente.query.get_or_404(id)
    db.session.delete(cliente)
    db.session.commit()
    return jsonify({'mensagem': 'Cliente excluído com sucesso'})

# ---------- PRODUTOS ---------- 
@app.route('/produtos', methods=['GET'])
def listar_produtos():
    produtos = Produto.query.all()
    return jsonify([{'id': p.id, 'nome': p.nome, 'preco': p.preco, 'estoque': p.estoque} for p in produtos])

@app.route('/produtos', methods=['POST'])
def criar_produto():
    data = request.json
    nome = data.get('nome')
    preco = data.get('preco')
    estoque = data.get('estoque', 0)

    if not nome or preco is None:
        return jsonify({'erro': 'Nome e preço são obrigatórios'}), 400

    produto = Produto(nome=nome, preco=preco, estoque=estoque)
    db.session.add(produto)
    db.session.commit()

    return jsonify({'id': produto.id, 'nome': produto.nome, 'preco': produto.preco, 'estoque': produto.estoque}), 201

@app.route('/produtos/<int:id>', methods=['PUT'])
def atualizar_produto(id):
    produto = Produto.query.get_or_404(id)
    data = request.json
    produto.nome = data.get('nome', produto.nome)
    produto.preco = data.get('preco', produto.preco)
    produto.estoque = data.get('estoque', produto.estoque)
    db.session.commit()
    return jsonify({'id': produto.id, 'nome': produto.nome, 'preco': produto.preco, 'estoque': produto.estoque})

@app.route('/produtos/<int:id>', methods=['DELETE'])
def excluir_produto(id):
    produto = Produto.query.get_or_404(id)
    db.session.delete(produto)
    db.session.commit()
    return jsonify({'mensagem': 'Produto excluído com sucesso'})

@app.route('/produtos/<int:id>', methods=['GET'])
def obter_produto(id):
    produto = Produto.query.get_or_404(id)
    return jsonify({'id': produto.id, 'nome': produto.nome, 'preco': produto.preco, 'estoque': produto.estoque})

@app.route('/produtos/<int:id>/estoque', methods=['PUT'])
def atualizar_estoque(id):
    data = request.get_json()
    quantidade = data.get('quantidade')
    
    produto = Produto.query.get(id)
    if produto:
        produto.estoque -= quantidade  # Decrementa o estoque
        db.session.commit()
        return jsonify({"message": "Estoque atualizado com sucesso"}), 200
    return jsonify({"message": "Produto não encontrado"}), 404


# ---------- COMPRAS ---------- 
@app.route('/compras', methods=['POST'])
def registrar_compra():
    dados = request.get_json()

    if not dados or 'cliente_id' not in dados or 'itens' not in dados:
        return jsonify({'erro': 'Requisição inválida'}), 400

    cliente_id = dados['cliente_id']
    itens = dados['itens']

    valor_total = 0
    for item in itens:
        produto_id = item['produto_id']
        quantidade = item['quantidade']

        produto = Produto.query.get(produto_id)
        if not produto:
            return jsonify({'erro': f'Produto ID {produto_id} não encontrado'}), 400

        if produto.estoque < quantidade:
            return jsonify({'erro': f'Estoque insuficiente para o produto {produto.nome}'}), 400

        valor_total += produto.preco * quantidade

    nova_compra = Compra(cliente_id=cliente_id, total=valor_total)
    db.session.add(nova_compra)
    db.session.commit()

    for item in itens:
        produto = Produto.query.get(item['produto_id'])
        item_compra = ItemCompra(
            compra_id=nova_compra.id,
            produto_id=item['produto_id'],
            quantidade=item['quantidade'],
            total=produto.preco * item['quantidade']
        )
        produto.estoque -= item['quantidade']
        db.session.add(item_compra)

    db.session.commit()

    return jsonify({'mensagem': 'Compra registrada com sucesso'}), 201



@app.route('/compras', methods=['GET'])
def listar_compras():
    compras = Compra.query.all()
    resultado = []
    for compra in compras:
        itens = [{
            'produto': item.produto.nome,
            'quantidade': item.quantidade,
            'total': item.total
        } for item in compra.itens]
        resultado.append({
            'id': compra.id,
            'cliente': compra.cliente.nome,
            'total': compra.total,
            'data': compra.data.strftime('%d/%m/%Y'),
            'itens': itens
        })
    return jsonify(resultado)

@app.route('/relatorio/geral', methods=['GET'])
def relatorio_geral():
    # Total de vendas por produto
    vendas_produto = db.session.query(
        Produto.nome,
        func.sum(ItemCompra.quantidade).label('quantidade_vendida')
    ).join(ItemCompra).group_by(Produto.id).all()

    # Total gasto por cliente
    vendas_cliente = db.session.query(
        Cliente.nome,
        func.sum(Compra.total).label('total_compras')
    ).join(Compra).group_by(Cliente.id).all()

    # Total geral vendido
    total_geral = db.session.query(func.sum(Compra.total)).scalar() or 0.0

    # Lista detalhada de compras
    compras = Compra.query.order_by(Compra.data.desc()).all()
    lista_compras = []
    for compra in compras:
        lista_compras.append({
            'id': compra.id,
            'cliente': compra.cliente.nome,
            'data': compra.data.strftime('%d/%m/%Y'),
            'total': compra.total,
            'itens': [
                {
                    'produto': item.produto.nome,
                    'quantidade': item.quantidade,
                    'total': item.total
                } for item in compra.itens
            ]
        })

    return jsonify({
        'resumo_vendas_produto': [{'produto': v[0], 'quantidade_vendida': v[1]} for v in vendas_produto],
        'resumo_vendas_cliente': [{'cliente': v[0], 'total_compras': v[1]} for v in vendas_cliente],
        'total_geral_vendido': total_geral,
        'compras_detalhadas': lista_compras
    })

@app.route('/vendas/cliente')
def vendas_por_cliente():
    resultados = db.session.query(
        Cliente.nome,
        func.count(Compra.id).label('total_compras')
    ).join(Compra, Compra.cliente_id == Cliente.id) \
     .group_by(Cliente.id).all()

    data = [{'nome': nome, 'total_compras': total} for nome, total in resultados]
    return jsonify(data)


@app.route('/vendas/produto')
def vendas_por_produto():
    resultados = db.session.query(
        Produto.nome,
        func.sum(ItemCompra.quantidade).label('total_vendido')
    ).join(ItemCompra, ItemCompra.produto_id == Produto.id) \
     .group_by(Produto.id).all()

    data = [{'nome': nome, 'total_vendido': total} for nome, total in resultados]
    return jsonify(data)


@app.route('/clientes/count')
def contar_clientes():
    total = Cliente.query.count()
    return jsonify({'total': total})

@app.route('/produtos/count')
def contar_produtos():
    total = Produto.query.count()
    return jsonify({'total': total})

@app.route('/compras/count')
def contar_compras():
    total = Compra.query.count()
    return jsonify({'total': total})

# ---------- EXECUÇÃO ----------
if __name__ == '__main__':
    app.run(debug=True)