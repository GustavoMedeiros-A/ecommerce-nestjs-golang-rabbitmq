import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

// Operation to create order BEFORE add to the databse

export type CreateOrderCommand = {
  client_id: number;
  items: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
};

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column()
  client_id: number; // auth user

  @Column()
  status: OrderStatus = OrderStatus.PENDING;

  @CreateDateColumn()
  created_at: Date;

  // Order have a array with orderItems
  // This cascade Means that if a INSERT the Order with the OrderItems, i'll add the items into the OrderItems
  @OneToMany(() => OrderItem, (item) => item.order, { cascade: ['insert'] })
  items: OrderItem[];

  static create_orders(input: CreateOrderCommand) {
    const order = new Order();
    order.client_id = input.client_id;
    order.items = input.items.map((item) => {
      const orderItem = new OrderItem();
      orderItem.product_id = item.product_id;
      orderItem.quantity = item.quantity;
      orderItem.price = item.price;
      return orderItem;
    });
    order.total = order.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
    return order;
  }
}
