"""
URL configuration for setup project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import include, path
from calculadora.views import ItemViewSet, PratoItemViewSet, PratoViewSet, ProdutoViewSet
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('admin/', admin.site.urls),
]


router = DefaultRouter(trailing_slash=False)
router.register('produtos', ProdutoViewSet)
router.register('itens', ItemViewSet)
router.register('pratos', PratoViewSet)
router.register('prato-itens', PratoItemViewSet)

urlpatterns = [
    path('adminsecreto-0jf093jf/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    path("api/v1/login", obtain_auth_token),
]