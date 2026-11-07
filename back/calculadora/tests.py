from decimal import Decimal

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Item, Prato, PratoItem, Produto, Restaurante


class ComercioApiTests(APITestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			username='um@teste.com',
			email='um@teste.com',
			password='senha-segura',
		)
		self.restaurante = Restaurante.objects.create(nome='Casa Um', usuario=self.user)
		self.outro_user = User.objects.create_user(
			username='dois@teste.com',
			email='dois@teste.com',
			password='outra-senha',
		)
		self.outro_restaurante = Restaurante.objects.create(
			nome='Casa Dois',
			usuario=self.outro_user,
		)
		self.client.force_authenticate(user=self.user)

	def criar_produto(self, nome, restaurante=None):
		return Produto.objects.create(
			nome=nome,
			restaurante=restaurante or self.restaurante,
		)

	def test_cadastro_cria_comercio_e_senha_hash(self):
		resposta = self.client.post('/api/v1/restaurantes', {
			'nome': 'Novo Comércio',
			'email': 'novo@teste.com',
			'senha': 'senha-segura',
		})

		self.assertEqual(resposta.status_code, status.HTTP_201_CREATED)
		self.assertIn('token', resposta.data)
		self.assertNotIn('senha', resposta.data['restaurante'])
		self.assertTrue(authenticate(username='novo@teste.com', password='senha-segura'))

	def test_login_retorna_token_do_comercio(self):
		resposta = self.client.post('/api/v1/login', {
			'email': 'um@teste.com',
			'senha': 'senha-segura',
		})

		self.assertEqual(resposta.status_code, status.HTTP_200_OK)
		self.assertEqual(resposta.data['restaurante']['id'], self.restaurante.id)

	def test_margem_geral_aplica_a_todos_os_pratos_do_comercio(self):
		prato = Prato.objects.create(
			nome='Bolo',
			restaurante=self.restaurante,
			margem_lucro_percentual='30.00',
		)
		outro_prato = Prato.objects.create(
			nome='Pizza',
			restaurante=self.restaurante,
			margem_lucro_percentual='40.00',
		)
		prato_de_outro_comercio = Prato.objects.create(
			nome='Torta',
			restaurante=self.outro_restaurante,
			margem_lucro_percentual='50.00',
		)

		resposta = self.client.patch(
			'/api/v1/restaurantes/margem-lucro',
			{'margem_lucro_percentual': '25.50'},
			format='json',
		)

		self.assertEqual(resposta.status_code, status.HTTP_200_OK)
		self.assertEqual(resposta.data['margem_lucro_percentual'], '25.50')
		self.assertEqual(resposta.data['pratos_atualizados'], 2)
		self.restaurante.refresh_from_db()
		prato.refresh_from_db()
		outro_prato.refresh_from_db()
		prato_de_outro_comercio.refresh_from_db()
		self.assertEqual(self.restaurante.margem_lucro_percentual, Decimal('25.50'))
		self.assertEqual(prato.margem_lucro_percentual, Decimal('25.50'))
		self.assertEqual(outro_prato.margem_lucro_percentual, Decimal('25.50'))
		self.assertEqual(prato_de_outro_comercio.margem_lucro_percentual, Decimal('50.00'))

	def test_margem_geral_informa_o_valor_salvo(self):
		self.restaurante.margem_lucro_percentual = Decimal('35.00')
		self.restaurante.save(update_fields=['margem_lucro_percentual'])

		resposta = self.client.get('/api/v1/restaurantes/margem-lucro')

		self.assertEqual(resposta.status_code, status.HTTP_200_OK)
		self.assertEqual(resposta.data['margem_lucro_percentual'], '35.00')

	def test_margem_geral_rejeita_valor_igual_ou_maior_que_cem(self):
		resposta = self.client.patch(
			'/api/v1/restaurantes/margem-lucro',
			{'margem_lucro_percentual': '100'},
			format='json',
		)

		self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
		self.restaurante.refresh_from_db()
		self.assertEqual(self.restaurante.margem_lucro_percentual, Decimal('20.00'))

	def test_margem_geral_exige_autenticacao(self):
		self.client.force_authenticate(user=None)

		resposta = self.client.get('/api/v1/restaurantes/margem-lucro')

		self.assertEqual(resposta.status_code, status.HTTP_401_UNAUTHORIZED)

	def test_novo_prato_usa_margem_geral_do_comercio(self):
		self.restaurante.margem_lucro_percentual = Decimal('35.00')
		self.restaurante.save(update_fields=['margem_lucro_percentual'])

		resposta = self.client.post('/api/v1/pratos', {'nome': 'Bolo'})

		self.assertEqual(resposta.status_code, status.HTTP_201_CREATED)
		self.assertEqual(resposta.data['margem_lucro_percentual'], '35.00')

	def test_item_criado_fica_vinculado_ao_produto_do_comercio(self):
		produto = self.criar_produto('Farinha')

		resposta = self.client.post('/api/v1/itens', {
			'produto_id': produto.id,
			'preco_custo': '12.50',
			'quantidade_compra': '1000',
			'unidade_medida': 'G',
		})

		self.assertEqual(resposta.status_code, status.HTTP_201_CREATED)
		item = Item.objects.get(pk=resposta.data['id'])
		self.assertEqual(item.produto, produto)
		self.assertEqual(item.produto.restaurante, self.restaurante)
		self.assertEqual(resposta.data['produto']['nome'], 'Farinha')

	def test_cadastro_de_item_rejeita_unidade_nao_suportada(self):
		produto = self.criar_produto('Farinha')

		resposta = self.client.post('/api/v1/itens', {
			'produto_id': produto.id,
			'preco_custo': '12.50',
			'quantidade_compra': '1000',
			'unidade_medida': 'PACOTE',
		})

		self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertFalse(Item.objects.exists())

	def test_cadastro_de_item_rejeita_preco_ou_quantidade_nao_positivos(self):
		produto = self.criar_produto('Farinha')
		dados_validos = {
			'produto_id': produto.id,
			'preco_custo': '12.50',
			'quantidade_compra': '1000',
			'unidade_medida': 'G',
		}

		for campo, valor in [('preco_custo', '0'), ('quantidade_compra', '0')]:
			with self.subTest(campo=campo):
				resposta = self.client.post(
					'/api/v1/itens',
					{**dados_validos, campo: valor},
				)
				self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)

		self.assertFalse(Item.objects.exists())

	def test_item_do_prato_fica_vinculado_ao_prato_e_item(self):
		produto = self.criar_produto('Farinha')
		item = Item.objects.create(
			produto=produto,
			preco_custo='12.50',
			quantidade_compra='1000',
			unidade_medida='G',
		)
		prato = Prato.objects.create(nome='Bolo', restaurante=self.restaurante)

		resposta = self.client.post('/api/v1/prato-itens', {
			'prato_id': prato.id,
			'item_id': item.id,
			'quantidade': '250',
		})

		self.assertEqual(resposta.status_code, status.HTTP_201_CREATED)
		prato_item = PratoItem.objects.get(pk=resposta.data['id'])
		self.assertEqual(prato_item.prato, prato)
		self.assertEqual(prato_item.item, item)
		self.assertEqual(resposta.data['item']['produto']['nome'], 'Farinha')

	def test_comercio_nao_lista_dados_de_outro(self):
		proprio = self.criar_produto('Farinha')
		outro = self.criar_produto('Queijo', self.outro_restaurante)

		produtos = self.client.get('/api/v1/produtos')
		self.assertEqual(produtos.status_code, status.HTTP_200_OK)
		self.assertEqual([produto['id'] for produto in produtos.data], [proprio.id])
		self.assertNotIn(outro.id, [produto['id'] for produto in produtos.data])

	def test_nao_permite_misturar_comercios_em_um_prato(self):
		produto = self.criar_produto('Farinha', self.outro_restaurante)
		item = Item.objects.create(
			produto=produto,
			preco_custo='12.50',
			quantidade_compra='1000',
			unidade_medida='G',
		)
		prato = Prato.objects.create(nome='Bolo', restaurante=self.restaurante)

		resposta = self.client.post('/api/v1/prato-itens', {
			'prato_id': prato.id,
			'item_id': item.id,
			'quantidade': '250',
		})

		self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertFalse(PratoItem.objects.exists())

	def test_prato_novo_comeca_com_margem_padrao_de_vinte_porcento(self):
		prato = Prato.objects.create(nome='Bolo', restaurante=self.restaurante)

		self.assertEqual(prato.margem_lucro_percentual, Decimal('20.00'))

	def test_margem_do_prato_pode_ser_atualizada(self):
		prato = Prato.objects.create(nome='Bolo', restaurante=self.restaurante)

		resposta = self.client.patch(
			f'/api/v1/pratos/{prato.id}',
			{'margem_lucro_percentual': '30.25'},
			format='json',
		)

		self.assertEqual(resposta.status_code, status.HTTP_200_OK)
		self.assertEqual(resposta.data['margem_lucro_percentual'], '30.25')
		prato.refresh_from_db()
		self.assertEqual(str(prato.margem_lucro_percentual), '30.25')

	def test_margem_nao_pode_ser_igual_ou_maior_que_cem(self):
		prato = Prato.objects.create(nome='Bolo', restaurante=self.restaurante)

		resposta = self.client.patch(
			f'/api/v1/pratos/{prato.id}',
			{'margem_lucro_percentual': '100'},
			format='json',
		)

		self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)

	def test_nao_pode_alterar_margem_de_prato_de_outro_comercio(self):
		prato = Prato.objects.create(nome='Bolo', restaurante=self.outro_restaurante)

		resposta = self.client.patch(
			f'/api/v1/pratos/{prato.id}',
			{'margem_lucro_percentual': '30.00'},
			format='json',
		)

		self.assertEqual(resposta.status_code, status.HTTP_404_NOT_FOUND)

	def test_str_de_item_e_associacao_usa_o_nome_do_produto(self):
		produto = self.criar_produto('Farinha')
		item = Item.objects.create(
			produto=produto,
			preco_custo='12.50',
			quantidade_compra='1000',
			unidade_medida='G',
		)
		prato = Prato.objects.create(nome='Bolo', restaurante=self.restaurante)
		prato_item = PratoItem.objects.create(prato=prato, item=item, quantidade='250')

		self.assertEqual(str(item), 'Farinha')
		self.assertEqual(str(prato_item), '250 G de Farinha em Bolo')

	def test_endpoints_de_registro_exigem_autenticacao(self):
		self.client.force_authenticate(user=None)

		resposta = self.client.get('/api/v1/produtos')

		self.assertEqual(resposta.status_code, status.HTTP_401_UNAUTHORIZED)
