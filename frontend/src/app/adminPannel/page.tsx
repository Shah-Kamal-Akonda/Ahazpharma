'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Interfaces matching backend DTOs
interface Category {
  id: number;
  name: string;
  image?: string;
  products: Product[];
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category?: Category;
  categoryId?: number;
  quantity: number;
  quantityUnit: 'ML' | 'GM';
  image?: string;
}

interface CreateCategoryDto {
  name: string;
  image?: string;
}

interface UpdateCategoryDto {
  name?: string;
  image?: string;
}

interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  categoryName?: string;
  quantity: number;
  quantityUnit: 'ML' | 'GM';
  image?: string;
}

interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: number;
  quantity?: number;
  quantityUnit?: 'ML' | 'GM';
  image?: string;
}

// API base URL
const API_URL = 'http://localhost:5001';

// Main Admin Panel Component
const AdminPanel = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  // Form hooks
  const categoryForm = useForm<CreateCategoryDto | UpdateCategoryDto>({ defaultValues: { name: '' } });
  const productForm = useForm<CreateProductDto | UpdateProductDto>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      quantityUnit: 'GM',
      categoryName: '',
    },
  });

  // Check access and authentication
  useEffect(() => {
    // Verify access from /profileAdmin
    const hasAdminAccess = sessionStorage.getItem('adminAccess') === 'true';
    if (!hasAdminAccess) {
      console.log('AdminPanel: Unauthorized access, redirecting to /login');
      router.push('/login');
      return;
    }

    // Get token
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('accessToken='))
      ?.split('=')[1];

    if (!token) {
      console.log('AdminPanel: No token, redirecting to /login');
      sessionStorage.removeItem('adminAccess');
      router.push('/login');
      return;
    }

    // Verify admin user
    const verifyUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.email !== 'shahkamalakonda@gmail.com') {
          console.log('AdminPanel: Not admin user, redirecting to /login');
          sessionStorage.removeItem('adminAccess');
          router.push('/login');
        }
      } catch (err) {
        console.error('AdminPanel: Failed to verify user:', err);
        sessionStorage.removeItem('adminAccess');
        router.push('/login');
      }
    };

    verifyUser();
  }, [router]);

  // Fetch data on mount
  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('accessToken='))
      ?.split('=')[1];

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to fetch categories');
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to fetch products');
      }
    };

    fetchCategories();
    fetchProducts();
  }, []);

  // Handle category image upload
  const uploadCategoryImage = async (file: File) => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('accessToken='))
      ?.split('=')[1];

    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(`${API_URL}/categories/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.url;
    } catch (error) {
      console.error('Error uploading category image:', error);
      setError('Failed to upload category image');
      return null;
    }
  };

  // Handle product image upload
  const uploadProductImage = async (file: File) => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('accessToken='))
      ?.split('=')[1];

    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(`${API_URL}/products/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.url;
    } catch (error) {
      console.error('Error uploading product image:', error);
      setError('Failed to upload product image');
      return null;
    }
  };

  // Create or update category
  const handleCategorySubmit = async (data: CreateCategoryDto | UpdateCategoryDto) => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('accessToken='))
      ?.split('=')[1];

    let imageUrl = data.image;
    if (categoryImage) {
      imageUrl = await uploadCategoryImage(categoryImage);
      if (!imageUrl) return;
    }

    try {
      if (editingCategory) {
        const response = await axios.put(
          `${API_URL}/categories/${editingCategory.id}`,
          { ...data, image: imageUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCategories(categories.map((cat) => (cat.id === editingCategory.id ? response.data : cat)));
        setEditingCategory(null);
      } else {
        const response = await axios.post(
          `${API_URL}/categories`,
          { ...data, image: imageUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCategories([...categories, response.data]);
      }
      categoryForm.reset();
      setCategoryImage(null);
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Failed to save category');
    }
  };

  // Create or update product
  const handleProductSubmit = async (data: CreateProductDto | UpdateProductDto) => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('accessToken='))
      ?.split('=')[1];

    let imageUrl = data.image;
    if (productImage) {
      imageUrl = await uploadProductImage(productImage);
      if (!imageUrl) return;
    }

    try {
      if (editingProduct) {
        const response = await axios.put(
          `${API_URL}/products/${editingProduct.id}`,
          { ...data, image: imageUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProducts(products.map((prod) => (prod.id === editingProduct.id ? response.data : prod)));
        setEditingProduct(null);
      } else {
        const response = await axios.post(
          `${API_URL}/products`,
          { ...data, image: imageUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProducts([...products, response.data]);
      }
      productForm.reset();
      setProductImage(null);
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Failed to save product');
    }
  };

  // Edit category
  const editCategory = (category: Category) => {
    setEditingCategory(category);
    categoryForm.reset({ name: category.name, image: category.image });
  };

  // Delete category
  const deleteCategory = async (id: number) => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('accessToken='))
      ?.split('=')[1];

    try {
      await axios.delete(`${API_URL}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(categories.filter((cat) => cat.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category');
    }
  };

  // Edit product
  const editProduct = (product: Product) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      quantityUnit: product.quantityUnit,
      image: product.image,
      categoryName: product.category?.name,
    });
  };

  // Delete product
  const deleteProduct = async (id: number) => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('accessToken='))
      ?.split('=')[1];

    try {
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((prod) => prod.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Admin Panel</h1>
      {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

      {/* Category Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Manage Categories</h2>
        <form
          onSubmit={categoryForm.handleSubmit(handleCategorySubmit)}
          className="bg-white p-6 rounded-lg shadow-md mb-6"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              {...categoryForm.register('name', { required: true })}
              className="mt-1 p-2 w-full border rounded-md"
            />
            {categoryForm.formState.errors.name && (
              <span className="text-red-500 text-sm">Category name is required</span>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Category Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCategoryImage(e.target.files?.[0] || null)}
              className="mt-1 p-2 w-full border rounded-md"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            {editingCategory ? 'Update Category' : 'Add Category'}
          </button>
          {editingCategory && (
            <button
              type="button"
              onClick={() => {
                setEditingCategory(null);
                categoryForm.reset();
              }}
              className="ml-4 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </form>

        {/* Categories List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">{category.name}</h3>
              {category.image && (
                <Image
                  src={`${API_URL}${category.image}`}
                  alt={category.name}
                  width={100}
                  height={100}
                  className="mt-2 rounded-md"
                />
              )}
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => editCategory(category)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Manage Products</h2>
        <form
          onSubmit={productForm.handleSubmit(handleProductSubmit)}
          className="bg-white p-6 rounded-lg shadow-md mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name</label>
              <input
                type="text"
                {...productForm.register('name', { required: true })}
                className="mt-1 p-2 w-full border rounded-md"
              />
              {productForm.formState.errors.name && (
                <span className="text-red-500 text-sm">Product name is required</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                {...productForm.register('description', { required: true })}
                className="mt-1 p-2 w-full border rounded-md"
              />
              {productForm.formState.errors.description && (
                <span className="text-red-500 text-sm">Description is required</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                step="0.01"
                {...productForm.register('price', { required: true, valueAsNumber: true })}
                className="mt-1 p-2 w-full border rounded-md"
              />
              {productForm.formState.errors.price && (
                <span className="text-red-500 text-sm">Price is required</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category Name</label>
              <select
                {...productForm.register('categoryName')}
                className="mt-1 p-2 w-full border rounded-md"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                {...productForm.register('quantity', { required: true, valueAsNumber: true })}
                className="mt-1 p-2 w-full border rounded-md"
              />
              {productForm.formState.errors.quantity && (
                <span className="text-red-500 text-sm">Quantity is required</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity Unit</label>
              <select
                {...productForm.register('quantityUnit', { required: true })}
                className="mt-1 p-2 w-full border rounded-md"
              >
                <option value="GM">GM</option>
                <option value="ML">ML</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProductImage(e.target.files?.[0] || null)}
                className="mt-1 p-2 w-full border rounded-md"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            {editingProduct ? 'Update Product' : 'Add Product'}
          </button>
          {editingProduct && (
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                productForm.reset();
              }}
              className="ml-4 mt-4 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </form>

        {/* Products List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-600">{product.description}</p>
              <p className="text-gray-600">Price: ${product.price}</p>
              <p className="text-gray-600">Quantity: {product.quantity} {product.quantityUnit}</p>
              {product.image && (
                <Image
                  src={`${API_URL}${product.image}`}
                  alt={product.name}
                  width={100}
                  height={100}
                  className="mt-2 rounded-md"
                />
              )}
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => editProduct(product)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;