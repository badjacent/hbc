using Back.Models;
using Back.Dto;
using System.Threading;
using System.Threading;

namespace Back.Data;

/*
 * This is a sample data class for the application.
 * In a real app, this would be replaced with a database.
 */

public class Repository {
    private readonly ReaderWriterLockSlim _lock = new ReaderWriterLockSlim();

    public Dictionary<int, Customer> Customers = new Dictionary<int, Customer> {
        { 1, new Customer { Id = 1, FirstName = "Michael", MiddleInitial = "J", LastName = "Phillips" } },
        { 2, new Customer { Id = 2, FirstName = "Roger", MiddleInitial = "A", LastName = "Baker" } },
        { 3, new Customer { Id = 3, FirstName = "Samuel", MiddleInitial = "T", LastName = "Samuelson" } },
    };
    public Dictionary<int, Employee> Employees = new Dictionary<int, Employee> {
        { 1, new Employee { Id = 1, FirstName = "Catherine", MiddleInitial = "J", LastName = "Stevens" } },
        { 2, new Employee { Id = 2, FirstName = "Michael", MiddleInitial = "A", LastName = "Chagger" } },
        { 3, new Employee { Id = 3, FirstName = "Henry", MiddleInitial = "B", LastName = "Pyle" } },
    };
    public Dictionary<int, Product> Products = new Dictionary<int, Product> {
        { 1, new Product { Id = 1, Name = "Ramen", Price = 1.56m } },
        { 2, new Product { Id = 2, Name = "Expensive Thing", Price = 92834.76m } },
        { 3, new Product { Id = 3, Name = "Futuristic Pizza", Price = 342.99m } },
    };
    public Dictionary<int, Order> Orders = new Dictionary<int, Order>();

    public event Action<DataChangedEvent<OrderDto>> OnOrderChanged = delegate { };
    public event Action<DataChangedEvent<Customer>> OnCustomerChanged = delegate { };
    

    public Customer AddCustomer(Customer customer) {
        DataChangedEvent<Customer>? change = null;
        _lock.EnterWriteLock();
        try
        {
            // ?? do we want to enforce uniqueness of customer name?
            customer.Id = Customers.Keys.Count > 0 ? Customers.Keys.Max() + 1 : 1;
            Customers[customer.Id] = customer;
            change = new DataChangedEvent<Customer>
            {
                Type = ChangeType.Added,
                Payload = customer
            };
            return customer;
        }
        finally
        {
            _lock.ExitWriteLock();
            if (change is not null) OnCustomerChanged?.Invoke(change);
        }
    }

    public Customer EditCustomer(Customer customer) {
        DataChangedEvent<Customer>? change = null;
        _lock.EnterWriteLock();
        try
        {
            Customers[customer.Id] = customer;
            change = new DataChangedEvent<Customer>
            {
                Type = ChangeType.Updated,
                Payload = customer
            };
            return customer;
        }
        finally
        {
            _lock.ExitWriteLock();
            if (change is not null) OnCustomerChanged?.Invoke(change);
        }
    }

    public void DeleteCustomer(Customer customer) {
        DataChangedEvent<Customer>? change = null;
        _lock.EnterWriteLock();
        try
        {
            // TODO: support soft delete? For a real app we would have a log of changes....
            if (Orders.Values.Any(o => o.CustomerId == customer.Id)) {
                throw new Exception("Customer has orders and cannot be deleted");
            }
            Customers.Remove(customer.Id);
            change = new DataChangedEvent<Customer>
            {
                Type = ChangeType.Deleted,
                Payload = customer
            };
        }
        finally
        {
            _lock.ExitWriteLock();
            if (change is not null) OnCustomerChanged?.Invoke(change);
        }
    }

    public Order[] OrdersForCustomer(int customerId) {
        _lock.EnterReadLock();
        try
        {
            return Orders.Values.Where(o => o.CustomerId == customerId).ToArray();
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }

    public Order AddOrder(Order order) {
        DataChangedEvent<OrderDto>? change = null;
        _lock.EnterWriteLock();
        try
        {
            if (order.Id != 0) throw new Exception("Order ID must be 0");
            if (!Customers.ContainsKey(order.CustomerId)) throw new Exception("Customer not found");
            if (!Products.ContainsKey(order.ProductId)) throw new Exception("Product not found");
            if (!Employees.ContainsKey(order.SalespersonId)) throw new Exception("Salesperson not found");

            order.Id = Orders.Keys.Count > 0 ? Orders.Keys.Max() + 1 : 1;
            Orders[order.Id] = order;
            Products.TryGetValue(order.ProductId, out var product);
            change = new DataChangedEvent<OrderDto>
            {
                Type = ChangeType.Added,
                Payload = OrderDto.EntityToDto(order, product)
            };
            return order;
        }
        finally
        {
            _lock.ExitWriteLock();
            if (change is not null) OnOrderChanged?.Invoke(change);
        }
    }

    public Order EditOrder(Order order) {
        DataChangedEvent<OrderDto>? change = null;
        _lock.EnterWriteLock();
        try
        {
            if (!Orders.ContainsKey(order.Id)) throw new Exception("Order not found");
            if (!Customers.ContainsKey(order.CustomerId)) throw new Exception("Customer not found");
            if (!Products.ContainsKey(order.ProductId)) throw new Exception("Product not found");
            if (!Employees.ContainsKey(order.SalespersonId)) throw new Exception("Salesperson not found");

            Orders[order.Id] = order;
            Products.TryGetValue(order.ProductId, out var product);
            change = new DataChangedEvent<OrderDto>
            {
                Type = ChangeType.Updated,
                Payload = OrderDto.EntityToDto(order, product)
            };
            return order;
        }
        finally
        {
            _lock.ExitWriteLock();
            if (change is not null) OnOrderChanged?.Invoke(change);
        }
    }

    public void DeleteOrder(Order order) {
        DataChangedEvent<OrderDto>? change = null;
        _lock.EnterWriteLock();
        try
        {
            if (!Orders.ContainsKey(order.Id)) throw new Exception("Order not found");
            Orders.Remove(order.Id);
            Products.TryGetValue(order.ProductId, out var product);
            change = new DataChangedEvent<OrderDto>
            {
                Type = ChangeType.Deleted,
                Payload = OrderDto.EntityToDto(order, product)
            };
        }
        finally
        {
            _lock.ExitWriteLock();
            if (change is not null) OnOrderChanged?.Invoke(change);
        }
    }
}
