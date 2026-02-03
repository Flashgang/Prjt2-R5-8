from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, CategoryViewSet, UserViewSet, login_view, borrow_book, my_loans, dashboard_stats, return_book, all_active_loans, dashboard_stats, RoleViewSet


router = DefaultRouter()
router.register(r'books', BookViewSet, basename='book')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'users', UserViewSet, basename='user')
router.register(r'roles', RoleViewSet, basename='role')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login_view, name='login'),
    path('books/<int:pk>/borrow/', borrow_book, name='borrow_book'),
    path('my-loans/', my_loans, name='my_loans'),
    path('dashboard/', dashboard_stats, name='dashboard'),
    path('loans/active/', all_active_loans, name='active_loans'),       
    path('loans/<int:loan_id>/return/', return_book, name='return_book'),
    path('dashboard/', dashboard_stats, name='dashboard'),

]