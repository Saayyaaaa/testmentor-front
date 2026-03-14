import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/http";
import { useToast } from "../components/Toast";
import "./AdminUsersPage.css";

export default function AdminUsersPage() {
  const { token, user } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState("ROLE_MENTOR");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  async function load(role = tab) {
    try {
      setLoading(true);
      const data = await apiFetch(`/api/admin/users?role=${role}`, { token });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      showToast(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin) load(tab);
  }, [tab, isAdmin]);

  async function changeRole(userId, role) {
    try {
      await apiFetch(`/api/admin/users/${userId}/role?role=${role}`, {
        method: "PATCH",
        token,
      });
      showToast("Role updated");
      await load(tab);
    } catch (e) {
      showToast(e.message || "Failed to update role");
    }
  }

  if (!isAdmin) {
    return (
      <div className="admin-users-page">
        <div className="admin-users-card">
          <h2>Access denied</h2>
          <p>Only admin can open this page.</p>
        </div>
      </div>
    );
  }

  async function deleteUser(userId, userName) {
    if (!window.confirm(`Delete user "${userName}"?`)) return;

    try {
        await apiFetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        token,
        });
        showToast("User deleted");
        await load(tab);
    } catch (e) {
        showToast(e.message || "Failed to delete user");
    }
    }

  return (
    <div className="admin-users-page">
      <div className="admin-users-card">
        <div className="admin-users-head">
          <h1>Users</h1>
          <p>Manage mentors and students separately.</p>
        </div>

        <div className="admin-users-tabs">
          <button
            className={tab === "ROLE_MENTOR" ? "active" : ""}
            onClick={() => setTab("ROLE_MENTOR")}
          >
            Mentors
          </button>
          <button
            className={tab === "ROLE_STUDENT" ? "active" : ""}
            onClick={() => setTab("ROLE_STUDENT")}
          >
            Students
          </button>
        </div>

        {loading ? (
          <div className="admin-users-empty">Loading...</div>
        ) : items.length === 0 ? (
          <div className="admin-users-empty">No users found.</div>
        ) : (
          <div className="admin-users-list">
            {items.map((item) => (
              <div className="admin-user-row" key={item.id}>
                <div className="admin-user-main">
                  <div className="admin-user-name">{item.name}</div>
                  <div className="admin-user-meta">
                    <span>{item.email || "No email"}</span>
                    <span>{item.roles}</span>
                  </div>
                </div>

                <div className="admin-user-actions">
                    {item.roles !== "ROLE_MENTOR" && (
                        <button onClick={() => changeRole(item.id, "ROLE_MENTOR")}>
                        Make mentor
                        </button>
                    )}

                    {item.roles !== "ROLE_STUDENT" && (
                        <button onClick={() => changeRole(item.id, "ROLE_STUDENT")}>
                        Make student
                        </button>
                    )}

                    <button
                        className="danger"
                        onClick={() => deleteUser(item.id, item.name)}
                    >
                        Delete
                    </button>
                    </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}