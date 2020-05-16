from django.contrib import admin
from .models import Recipe, Ingredient, Instruction, Topic

class IngredientInLine(admin.TabularInline):
    model = Ingredient
    extra = 1

class InstructionInLine(admin.TabularInline):
    model = Instruction
    extra = 1

class RecipeAdmin(admin.ModelAdmin):
    list_display = ('recipe_name', 'pub_date', 'was_published_recently')
    list_filter = ['pub_date']

    inlines = [IngredientInLine, InstructionInLine]

# Register your models here.
admin.site.register(Recipe, RecipeAdmin)