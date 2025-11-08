# Correção Crítica - External Reference

## Problema Identificado

Quando um cliente faz um pagamento, estavam sendo criados **DOIS pedidos separados**:

### Pedido 1 (Original)
- ✅ Tem todos os dados do cliente (nome, email, telefone)
- ❌ NÃO recebe o pagamento
- ❌ Fica eternamente pendente

### Pedido 2 (Fantasma)
- ❌ NÃO tem dados do cliente
- ✅ Recebe o pagamento e é aprovado
- ❌ Email falha por falta de dados

## Causa Raiz

No arquivo `MercadoPagoCheckout.tsx`, o campo `external_reference` NÃO estava sendo enviado.

Quando o Mercado Pago não recebe o `external_reference`, ele cria um NOVO ID no formato `order-{timestamp}`, resultando em dois pedidos distintos.

## Correção Aplicada

```diff
const preferenceData = {
  items: [...],
  payer: {...},
  backUrls: {...},
+ external_reference: order.orderId, // CRÍTICO: Usar o mesmo orderId!
};
```

## Status da Correção

✅ **Frontend deployado** às 15:18 BRT
- Novos pedidos usarão o orderId correto
- O pagamento será associado ao pedido original
- Emails serão enviados corretamente

## Para o Pedido Atual (order-3c579cf5...)

Este pedido específico está "órfão" e precisa de intervenção manual:

### Opção 1: Atualizar Manualmente no DynamoDB
```bash
# Copiar dados do pedido original para o pedido que recebeu pagamento
aws dynamodb update-item \
  --table-name natal-orders \
  --key '{"orderId":{"S":"order-1762625389164"}}' \
  --update-expression "SET customerEmail = :email, customerName = :name, orderNumber = :num" \
  --expression-attribute-values '{
    ":email":{"S":"andrei.rachadel@outlook.com"},
    ":name":{"S":"Andrei Carlos Rachadel"},
    ":num":{"S":"SB25388412"}
  }'
```

### Opção 2: Enviar Email Manualmente
Use o admin para verificar o pedido aprovado e enviar confirmação manual.

## Fluxo Correto (Após Correção)

1. Cliente cria pedido → `order-ABC123`
2. Mercado Pago recebe `external_reference: order-ABC123`
3. Pagamento aprovado → Webhook atualiza `order-ABC123`
4. Email enviado com sucesso (pedido tem todos os dados)

## Monitoramento

Para verificar se está funcionando:
```bash
# Ver preferências criadas
aws logs tail /aws/lambda/natal-menu-backend-v2-CreatePreferenceFunction-XXX --follow

# Verificar se external_reference está sendo enviado
# Deve aparecer: "external_reference": "order-..."
```

## Prevenção Futura

1. Sempre incluir `external_reference` em integrações de pagamento
2. Validar que o pedido do webhook tem dados do cliente antes de processar
3. Adicionar alertas quando pedidos órfãos são criados

---

**Implementado por:** Engenharia Sweet Bar  
**Data:** 08/11/2024 15:18 BRT  
**Severidade:** CRÍTICA  
**Impacto:** Todos os pagamentos estavam criando pedidos duplicados
