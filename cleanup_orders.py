#!/usr/bin/env python3
"""
Limpeza de Pedidos de Teste - Sweet Bar
Deleta todos os pedidos do DynamoDB
"""

import boto3
import sys

TABLE_NAME = 'natal-orders'

def main():
    print("\n" + "="*50)
    print("LIMPEZA DE PEDIDOS DE TESTE")
    print("="*50 + "\n")

    # Inicializar cliente DynamoDB
    dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
    table = dynamodb.Table(TABLE_NAME)

    # Contar pedidos
    print("[1/3] Contando pedidos...")
    response = table.scan(Select='COUNT')
    count = response['Count']

    print(f"Total de pedidos encontrados: {count}\n")

    if count == 0:
        print("✅ Tabela já está vazia!\n")
        return

    # Confirmar
    print(f"⚠️  ATENÇÃO: Esta ação irá deletar TODOS os {count} pedidos!")
    confirm = input("\nTem certeza? (digite SIM): ")

    if confirm != "SIM":
        print("\n❌ Operação cancelada.\n")
        return

    # Buscar todos os pedidos
    print("\n[2/3] Buscando pedidos...")
    response = table.scan(ProjectionExpression='orderId')
    items = response['Items']

    # Paginação se necessário
    while 'LastEvaluatedKey' in response:
        response = table.scan(
            ProjectionExpression='orderId',
            ExclusiveStartKey=response['LastEvaluatedKey']
        )
        items.extend(response['Items'])

    print(f"Pedidos a deletar: {len(items)}\n")

    # Deletar
    print("[3/3] Deletando pedidos...")
    deleted = 0
    failed = 0

    for item in items:
        try:
            table.delete_item(Key={'orderId': item['orderId']})
            deleted += 1
            if deleted % 10 == 0:
                print(f"  Progresso: {deleted}/{len(items)}")
        except Exception as e:
            failed += 1
            print(f"  ✗ Erro: {item['orderId']}: {e}")

    # Resultado
    print("\n" + "="*50)
    print("LIMPEZA CONCLUÍDA!")
    print("="*50)
    print(f"✅ Deletados: {deleted}")
    print(f"❌ Falhas: {failed}")

    # Verificar
    final = table.scan(Select='COUNT')['Count']
    print(f"Restantes: {final}\n")

    if final == 0:
        print("✅ Sistema pronto para produção!\n")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Operação cancelada pelo usuário.\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erro: {e}\n")
        sys.exit(1)

