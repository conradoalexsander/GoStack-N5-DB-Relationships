import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Product from '@modules/products/infra/typeorm/entities/Product';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IFindProducts {
  id: string;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

interface ICreateOrderProduct {
  product_id: string;
  price: number;
  quantity: number;
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // TODO

    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('No customer with the provided id could be found.');
    }

    const productsIds: IFindProducts[] = products.map(product => ({
      id: product.id,
    }));

    const productsData = await this.productsRepository.findAllById(productsIds);

    products.forEach(product => {
      const indexChecker = productsData.findIndex(i => i.id === product.id);
      if (indexChecker < 0) {
        throw new AppError(
          `no products could be found for product with id ${product.id}`,
          400,
        );
      }
    });

    const orderProducts: ICreateOrderProduct[] = [];

    const updatedProductsData = productsData.map(productData => {
      const productIndex = products.findIndex(i => i.id === productData.id);

      if (productData.quantity < products[productIndex].quantity) {
        throw new AppError(
          `Insufficient quantity for product ${productData.name}`,
        );
      }

      const {
        id,
        name,
        price,
        created_at,
        updated_at,
        order_products,
      } = productData;

      const updatedProduct: Product = {
        id,
        name,
        price,
        quantity: productData.quantity - products[productIndex].quantity,
        created_at,
        updated_at,
        order_products,
      };

      orderProducts.push({
        product_id: id,
        price,
        quantity: products[productIndex].quantity,
      });

      return updatedProduct;
    });

    await this.productsRepository.updateQuantity(updatedProductsData);

    const order = this.ordersRepository.create({
      customer,
      products: orderProducts,
    });

    return order;
  }
}

export default CreateOrderService;
