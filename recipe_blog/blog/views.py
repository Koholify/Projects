from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.views import generic
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.models import User
from django.urls import reverse
from django.db.utils import IntegrityError
from django.contrib import messages

from .models import Recipe

# Create your views here.

class IndexView(generic.ListView):
    template_name = 'blog/index.html'
    context_object_name = 'latest_recipe_list'

    def get_queryset(self):
        return Recipe.objects.order_by('-pub_date')[:10]

class DetailView(generic.DetailView):
    template_name = 'blog/detail.html'
    model = Recipe

def auth(request):
    username = request.POST['username']
    password = request.POST['password']
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return HttpResponseRedirect(reverse('blog:index'))
    else:
        messages.error(request,"Username or Password invalid")
        return HttpResponseRedirect(reverse('blog:login'))

def login_view(request):
    return render(request, 'blog/login.html')

def register(request):
    return render(request, 'blog/register.html')

def create_user(request):
    username = request.POST['username']
    password = request.POST['password']
    email = request.POST['email']
    try:
        User.objects.create_user(username, email, password)
        user = authenticate(request, username=username, password=password)
        login(request,user)
        return HttpResponseRedirect(reverse('blog:index'))
    except IntegrityError:
        messages.error(request, 'Username is already taken') #xml check username in realtime
        return HttpResponseRedirect(reverse('blog:register'))

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse('blog:login'))

def change_password(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)
            messages.success(request, "Password updated successfully")
        else:
            messages.error(request, "Correct errors to change password")
    return HttpResponseRedirect(reverse('blog:profile'))

class ProfileView(generic.ListView):
    template_name = 'blog/profile.html'
    model = Recipe

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form']