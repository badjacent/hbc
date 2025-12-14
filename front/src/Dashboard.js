import React, { useEffect, useState } from 'react';
import { useLiveCustomers } from './useLiveCustomers'; // Your previous hook
import { useLiveOrders } from './useLiveOrders';       // The new hook you provided
import OrderForm from './OrderForm';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5189';

export default function Dashboard() {
  const { customers } = useLiveCustomers();
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  // Helper to clear edit state when switching customers
  const handleCustomerSelect = (id) => {
    setSelectedCustomerId(id);
    setOrderToEdit(null); 
    setIsEditingCustomer(false);
    setShowAddCustomer(false);
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      <header style={{ marginBottom: "20px" }}>
        <h1>Product Manager</h1>
      </header>

      {/* --- TOP: CUSTOMER SELECTION --- */}
      <section style={{ height: "250px", display: "flex", gap: "20px" }}>
        
        {/* Left: Customer List */}
        <div style={{ flex: 1, border: "1px solid #ccc", overflowY: "auto", borderRadius: "4px" }}>
          <h3 style={{ position: "sticky", top: 0, background: "#eee", margin: 0, padding: "10px" }}>
            <span>Customers</span>
            <button
              style={{ float: "right", padding: "6px 10px", marginTop: "-4px" }}
              onClick={() => {
                setShowAddCustomer((prev) => !prev);
                setIsEditingCustomer(false);
                setSelectedCustomerId(null);
              }}
            >
              {showAddCustomer ? "Close" : "Add"}
            </button>
          </h3>
          {showAddCustomer ? (
            <AddCustomerForm
              onCreated={() => setShowAddCustomer(false)}
            />
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {customers.map(c => (
                <li 
                  key={c.id} 
                  onClick={() => handleCustomerSelect(c.id)}
                  style={{ 
                    padding: "10px", 
                    cursor: "pointer",
                    background: selectedCustomerId === c.id ? "#e3f2fd" : "transparent",
                    borderBottom: "1px solid #f0f0f0"
                  }}
                >
                  {c.firstName} {c.lastName}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right: Order List for Selected Customer */}
        <div style={{ flex: 2, border: "1px solid #ccc", borderRadius: "4px", overflowY: "auto" }}>
          {selectedCustomerId ? (
            /* CRITICAL TRICK: key={selectedCustomerId}
               This forces React to destroy and recreate the OrderList component
               whenever the customer changes. This ensures your 'useLiveOrders' 
               hook reconnects with the correct customer ID filter.
            */
            <>
              <CustomerPanel
                customer={selectedCustomer}
                isEditing={isEditingCustomer}
                onEdit={() => setIsEditingCustomer(true)}
                onCancelEdit={() => setIsEditingCustomer(false)}
                onSaved={() => setIsEditingCustomer(false)}
              />
              <OrderList 
                key={selectedCustomerId} 
                customerId={selectedCustomerId} 
                onEdit={(order) => setOrderToEdit(order)}
              />
            </>
          ) : (
            <div style={{ padding: "20px", color: "#666", textAlign: "center" }}>
              Select a customer to view orders
            </div>
          )}
        </div>
      </section>

      {/* --- HORIZONTAL LINE --- */}
      <hr style={{ margin: "30px 0", border: "0", borderTop: "2px solid #333" }} />

      {/* --- BOTTOM: ORDER ENTRY FORM --- */}
      <section>
        {selectedCustomerId ? (
          <OrderForm 
            customerId={selectedCustomerId}
            orderToEdit={orderToEdit}
            onCancel={() => setOrderToEdit(null)}
            onSuccess={() => setOrderToEdit(null)}
          />
        ) : (
          <p style={{ color: "#888" }}>Select a customer above to enable order entry.</p>
        )}
      </section>
    </div>
  );
}

function CustomerPanel({ customer, isEditing, onEdit, onCancelEdit, onSaved }) {
  const [form, setForm] = useState({ firstName: '', middleInitial: '', lastName: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customer) {
      setForm({
        firstName: customer.firstName || '',
        middleInitial: customer.middleInitial || '',
        lastName: customer.lastName || '',
      });
    }
  }, [customer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer) return;
    setSaving(true);
    try {
      const payload = { id: customer.id, ...form };
      const res = await fetch(`${API_BASE}/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      onSaved();
    } catch (err) {
      console.error(err);
      alert(`Failed to save customer: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (!customer) return null;

  return (
    <div style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
      {!isEditing ? (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: "bold" }}>{customer.firstName} {customer.middleInitial} {customer.lastName}</div>
            <div style={{ color: "#666", fontSize: "0.9em" }}>Customer #{customer.id}</div>
          </div>
          <button onClick={onEdit} style={{ padding: "8px 12px" }}>Edit customer</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "0.85em", fontWeight: "bold" }}>First name</label>
            <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "0.85em", fontWeight: "bold" }}>Middle</label>
            <input value={form.middleInitial} onChange={e => setForm({ ...form, middleInitial: e.target.value })} required />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "0.85em", fontWeight: "bold" }}>Last name</label>
            <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="submit" disabled={saving} style={{ padding: "8px 14px" }}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={onCancelEdit} style={{ padding: "8px 12px" }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// --- SUB-COMPONENT: ORDER LIST ---
function OrderList({ customerId, onEdit }) {
  // We use your exact hook here!
  const { orders, isConnected } = useLiveOrders(customerId);
  const handleDelete = async (orderId) => {
    if (!window.confirm(`Delete order #${orderId}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 204) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
    } catch (err) {
      console.error(err);
      alert(`Failed to delete order: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <div style={{ padding: "20px" }}>
        <h3>Orders {isConnected ? "🟢" : "🔴"}</h3>
        <p>No orders found for this customer.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ position: "sticky", top: 0, background: "#eee", margin: 0, padding: "10px", display: "flex", justifyContent: "space-between" }}>
        <span>Orders</span>
        <span style={{ fontSize: "0.8em", color: isConnected ? "green" : "red" }}>
           {isConnected ? "Live Connected" : "Connecting..."}
        </span>
      </h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f9f9f9", textAlign: "left", fontSize: "0.9em" }}>
            <th style={{ padding: "8px" }}>ID</th>
            <th style={{ padding: "8px" }}>Product</th>
            <th style={{ padding: "8px" }}>Qty</th>
            <th style={{ padding: "8px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "8px" }}>{order.id}</td>
              <td style={{ padding: "8px" }}>{order.productName || `Product #${order.productId}`}</td>
              <td style={{ padding: "8px" }}>{order.quantity}</td>
              <td style={{ padding: "8px" }}>
                <button onClick={() => onEdit(order)} style={{ marginRight: "6px" }}>Edit</button>
                <button onClick={() => handleDelete(order.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AddCustomerForm({ onCreated }) {
  const [form, setForm] = useState({ firstName: '', middleInitial: '', lastName: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          middleInitial: form.middleInitial,
          lastName: form.lastName,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      setForm({ firstName: '', middleInitial: '', lastName: '' });
      onCreated?.();
    } catch (err) {
      console.error(err);
      alert(`Failed to create customer: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          required
          placeholder="First name"
          value={form.firstName}
          onChange={e => setForm({ ...form, firstName: e.target.value })}
          style={{ flex: 1, padding: "8px" }}
        />
        <input
          required
          placeholder="M"
          maxLength={2}
          value={form.middleInitial}
          onChange={e => setForm({ ...form, middleInitial: e.target.value })}
          style={{ width: "60px", padding: "8px" }}
        />
        <input
          required
          placeholder="Last name"
          value={form.lastName}
          onChange={e => setForm({ ...form, lastName: e.target.value })}
          style={{ flex: 1, padding: "8px" }}
        />
      </div>
      <div>
        <button type="submit" disabled={saving} style={{ padding: "8px 12px" }}>
          {saving ? "Saving..." : "Add customer"}
        </button>
      </div>
    </form>
  );
}
