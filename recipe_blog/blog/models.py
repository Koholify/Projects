from django.db import models
from django.utils import timezone
import datetime

# Create your models here.
class Topic(models.Model):
    topic = models.CharField(max_length=200)

    def __str__(self):
        return self.topic

class Recipe(models.Model):
    recipe_name = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published')
    ##recipe_pic = models.

    def __str__(self):
        return self.recipe_name

    def was_published_recently(self):
        now = timezone.now()
        return now - datetime.timedelta(days=30) <= self.pub_date <= now

    was_published_recently.boolean = True

class Ingredient(models.Model):
    ingredient_name = models.CharField(max_length=300)
    ingredient_amount = models.CharField(max_length=50)
    recipe = models.ForeignKey(Recipe,on_delete=models.CASCADE)

    def __str__(self):
        return self.ingredient_name

class Instruction(models.Model):
    instruction_step = models.CharField(max_length=1000)
    recipe = models.ForeignKey(Recipe,on_delete=models.CASCADE)

    def __str__(self):
        return self.instruction_step