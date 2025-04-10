import graphene
from graphene_django import DjangoObjectType
from .models import Item


class ItemType(DjangoObjectType):
    class Meta:
        model = Item
        fields = ("id", "name", "description", "created_at")


class Query(graphene.ObjectType):
    # test… pass a string directy 
    hello = graphene.String(default_value="Hello, World!")

    # return items 
    items = graphene.List(ItemType)
    item = graphene.Field(ItemType, id=graphene.Int())
    
    def resolve_items(self, info):
        return Item.objects.all()
    
    def resolve_item(self, info, id):
        return Item.objects.get(pk=id)


schema = graphene.Schema(query=Query)