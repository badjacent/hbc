import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5189';

export default function OrderForm({ customerId, orderToEdit, onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    employeeId: "",
    productId: "",
    quantity: 1
  });
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [employeesError, setEmployeesError] = useState(null);

  // Populate form if editing; Clear if creating
  useEffect(() => {
    if (orderToEdit) {
      setFormData({
        employeeId: orderToEdit.salespersonId,
        productId: orderToEdit.productId,
        quantity: orderToEdit.quantity
      });
    } else {
      setFormData({ employeeId: "", productId: "", quantity: 1 });
    }
  }, [orderToEdit]);

  // Load products once from the API; list is static.
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setProductsError(err instanceof Error ? err.message : "Failed to load products");
      }
    };
    loadProducts();
  }, []);

  // Load employees from the API; list is static.
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/employees`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        console.error(err);
        setEmployeesError(err instanceof Error ? err.message : "Failed to load employees");
      }
    };
    loadEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      // Ensure we parse numbers so C# receives Ints, not Strings
      customerId: parseInt(customerId),
      salespersonId: parseInt(formData.employeeId),
      productId: parseInt(formData.productId),
      quantity: parseInt(formData.quantity),
      // If editing, preserve the ID
      ...(orderToEdit && { id: orderToEdit.id })
    };

    const url = orderToEdit 
      ? `${API_BASE}/api/orders/${orderToEdit.id}` // Update
      : `${API_BASE}/api/orders`;                  // Create
      
    const method = orderToEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onSuccess(); // Clear selection
        if (!orderToEdit) {
           // If we just added new, clear form manually
           setFormData({ employeeId: "", productId: "", quantity: 1 });
        }
      } else {
        alert(`Failed to save order.\nStatus: ${res.status}\nPayload: ${JSON.stringify(payload, null, 2)}`);
      }
    } catch (err) {
      console.error(err);
      alert(`Failed to save order.\nPayload: ${JSON.stringify(payload, null, 2)}\nError: ${err.message}`);
    }
  };

  return (
    <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", border: "1px solid #ddd" }}>
      <h3 style={{ marginTop: 0 }}>
        {orderToEdit ? `Editing Order #${orderToEdit.id}` : "Add New Order"}
      </h3>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "15px", alignItems: "flex-end" }}>
        
        {/* Employee Select */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "0.9em", fontWeight: "bold" }}>Employee</label>
          <select 
            required 
            value={formData.employeeId}
            onChange={e => setFormData({...formData, employeeId: e.target.value})}
            style={{ padding: "8px", width: "150px" }}
          >
            <option value="">-- Select --</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
          </select>
          {employeesError && (
            <span style={{ color: "red", fontSize: "0.85em" }}>
              {employeesError}
            </span>
          )}
        </div>

        {/* Product Select */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "0.9em", fontWeight: "bold" }}>Product</label>
          <select 
            required 
            value={formData.productId}
            onChange={e => setFormData({...formData, productId: e.target.value})}
            style={{ padding: "8px", width: "150px" }}
          >
            <option value="">-- Select --</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {productsError && (
            <span style={{ color: "red", fontSize: "0.85em" }}>
              {productsError}
            </span>
          )}
        </div>

        {/* Quantity Input */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "0.9em", fontWeight: "bold" }}>Qty</label>
          <input 
            type="number" 
            min="1" 
            required
            value={formData.quantity}
            onChange={e => setFormData({...formData, quantity: e.target.value})}
            style={{ padding: "8px", width: "80px" }}
          />
        </div>

        {/* Actions */}
        <div>
          <button type="submit" style={{ padding: "9px 20px", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            {orderToEdit ? "Update" : "Add"}
          </button>
          
          {orderToEdit && (
            <button 
              type="button" 
              onClick={onCancel} 
              style={{ marginLeft: "10px", padding: "9px 15px", background: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
