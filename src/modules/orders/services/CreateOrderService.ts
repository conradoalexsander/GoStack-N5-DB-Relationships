import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
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

    @inject('ProductssRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // TODO
    const productsIds: IFindProducts[] = products.map(product => ({
      id: product.id,
    }));

    const productsData = await this.productsRepository.findAllById(productsIds);

    const customer = await this.customersRepository.findById(customer_id);

    const orderProducts: ICreateOrderProduct[] = [];

    if (!customer) {
      throw new AppError('No customer with the provided id could be found.');
    }

    productsData.forEach(product => {
      const { id, price } = product;

      const productIndex = products.findIndex(i => i.id === product.id);

      if (product.quantity < products[productIndex].quantity) {
        throw new AppError(`Insufficient quanitty for product ${product.name}`);
      }

      const addProduct: ICreateOrderProduct = {
        product_id: id,
        price,
        quantity: products[productIndex].quantity,
      };

      orderProducts.push(addProduct);
    });

    await this.productsRepository.updateQuantity(products);

    const order = this.ordersRepository.create({
      customer,
      products: orderProducts,
    });

    return order;
  }
}

export default CreateOrderService;
