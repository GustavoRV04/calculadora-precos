from rest_framework import status
from rest_framework.test import APITestCase

from .models import Item, Prato, PratoItem, Produto


class CadastroRelacionamentosApiTests(APITestCase):
	def test_item_criado_fica_vinculado_ao_produto(self):
		produto = Produto.objects.create(nome='Farinha')

		resposta = self.client.post('/api/v1/itens', {
			'produto_id': produto.id,
			'preco_custo': '12.50',
			'quantidade_compra': '1000',
			'unidade_medida': 'G',
		})

		self.assertEqual(resposta.status_code, status.HTTP_201_CREATED)
		item = Item.objects.get(pk=resposta.data['id'])
		self.assertEqual(item.produto, produto)
		self.assertEqual(resposta.data['produto']['nome'], 'Farinha')

	def test_item_do_prato_fica_vinculado_ao_prato_e_item(self):
		produto = Produto.objects.create(nome='Farinha')
		item = Item.objects.create(
			produto=produto,
			preco_custo='12.50',
			quantidade_compra='1000',
			unidade_medida='G',
		)
		prato = Prato.objects.create(nome='Bolo')

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

	def test_str_de_item_e_associacao_usa_o_nome_do_produto(self):
		produto = Produto.objects.create(nome='Farinha')
		item = Item.objects.create(
			produto=produto,
			preco_custo='12.50',
			quantidade_compra='1000',
			unidade_medida='G',
		)
		prato = Prato.objects.create(nome='Bolo')
		prato_item = PratoItem.objects.create(prato=prato, item=item, quantidade='250')

		self.assertEqual(str(item), 'Farinha')
		self.assertEqual(str(prato_item), '250 G de Farinha em Bolo')
