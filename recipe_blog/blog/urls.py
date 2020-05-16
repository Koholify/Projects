from django.urls import path
from . import views

app_name='blog'
urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('<int:pk>/', views.DetailView.as_view(), name='detail'),
    path('login/', views.login_view, name='login'),
    path('auth/', views.auth, name='auth'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register, name='register'),
    path('createuser/', views.create_user, name='createuser'),
    path('chpswrd/', views.change_password, name='changepassword'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
]