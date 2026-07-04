"use client";

import React, { useState, useEffect, useMemo } from "react";
import Header from "../header/Header";
import styles from "./UserManagement.module.css";

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: "Administrador" | "Vendedor" | "Cliente";
  estado: "Activo" | "Inactivo";
  fechaRegistro: string;
}

const DEFAULT_USERS: User[] = [
  {
    id: 1,
    nombre: "Camilo",
    apellido: "Rodriguez",
    email: "camilo@legendary.com",
    telefono: "555-1234",
    rol: "Administrador",
    estado: "Activo",
    fechaRegistro: "2026-01-15",
  },
  {
    id: 2,
    nombre: "Sofia",
    apellido: "Martinez",
    email: "sofia.m@legendary.com",
    telefono: "555-5678",
    rol: "Vendedor",
    estado: "Activo",
    fechaRegistro: "2026-03-22",
  },
  {
    id: 3,
    nombre: "Mateo",
    apellido: "Gomez",
    email: "mateo@gmail.com",
    telefono: "555-8765",
    rol: "Cliente",
    estado: "Activo",
    fechaRegistro: "2026-05-10",
  },
  {
    id: 4,
    nombre: "Valentina",
    apellido: "Lopez",
    email: "valentina@gmail.com",
    telefono: "555-4321",
    rol: "Cliente",
    estado: "Inactivo",
    fechaRegistro: "2026-06-01",
  },
];

type ModalMode = "create" | "edit" | "delete" | null;

interface ToastState {
  message: string;
  type: "success" | "error";
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("Todos");
  
  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Omit<User, "id" | "fechaRegistro">>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    rol: "Cliente",
    estado: "Activo",
  });
  
  // Toast state
  const [toast, setToast] = useState<ToastState | null>(null);

  // Initialize users from LocalStorage or mock data
  useEffect(() => {
    const saved = localStorage.getItem("lm_mock_users");
    if (saved) {
      try {
        setUsers(JSON.parse(saved));
      } catch {
        setUsers(DEFAULT_USERS);
      }
    } else {
      setUsers(DEFAULT_USERS);
      localStorage.setItem("lm_mock_users", JSON.stringify(DEFAULT_USERS));
    }
  }, []);

  // Sync users to LocalStorage
  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem("lm_mock_users", JSON.stringify(newUsers));
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        `${user.nombre} ${user.apellido}`.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.telefono.includes(search);
        
      const matchesRole = roleFilter === "Todos" || user.rol === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.estado === "Activo").length;
    const admins = users.filter((u) => u.rol === "Administrador").length;
    const sellers = users.filter((u) => u.rol === "Vendedor").length;
    return { total, active, admins, sellers };
  }, [users]);

  // Actions handler
  const handleOpenCreateModal = () => {
    setFormData({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      rol: "Cliente",
      estado: "Activo",
    });
    setModalMode("create");
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono,
      rol: user.rol,
      estado: user.estado,
    });
    setModalMode("edit");
  };

  const handleOpenDeleteModal = (user: User) => {
    setSelectedUser(user);
    setModalMode("delete");
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedUser(null);
  };

  const validateForm = () => {
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      showToast("Por favor complete nombre y apellido", "error");
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      showToast("Por favor ingrese un email válido", "error");
      return false;
    }
    if (!formData.telefono.trim()) {
      showToast("Por favor ingrese un teléfono", "error");
      return false;
    }
    return true;
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const today = new Date().toISOString().split("T")[0];
    
    const newUser: User = {
      id: newId,
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      email: formData.email.trim(),
      telefono: formData.telefono.trim(),
      rol: formData.rol,
      estado: formData.estado,
      fechaRegistro: today,
    };

    saveUsers([...users, newUser]);
    showToast(`Usuario ${newUser.nombre} creado con éxito`);
    handleCloseModal();
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !validateForm()) return;

    const updatedUsers = users.map((u) => {
      if (u.id === selectedUser.id) {
        return {
          ...u,
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          email: formData.email.trim(),
          telefono: formData.telefono.trim(),
          rol: formData.rol,
          estado: formData.estado,
        };
      }
      return u;
    });

    saveUsers(updatedUsers);
    showToast("Usuario actualizado correctamente");
    handleCloseModal();
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    const updatedUsers = users.filter((u) => u.id !== selectedUser.id);
    saveUsers(updatedUsers);
    showToast("Usuario eliminado correctamente");
    handleCloseModal();
  };

  return (
    <div className={styles.shell}>
      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : ""}`}>
          <span>{toast.message}</span>
        </div>
      )}
      
      <div className={modalMode ? styles.contentBlur : styles.content}>
        <Header />
        
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Administración</p>
            <h1 className={styles.title}>Gestión de Usuarios</h1>
            <p className={styles.subtitle}>
              Visualiza, crea, edita o elimina los usuarios de Legendary Motorsport.
              Los datos se guardan de forma local en tu navegador.
            </p>
          </div>
        </header>

        {/* Stats Grid */}
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Usuarios Totales</div>
            <div className={styles.statValue}>{stats.total}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Usuarios Activos</div>
            <div className={styles.statValue}>{stats.active}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Administradores</div>
            <div className={styles.statValue}><span className={styles.statAccent}>{stats.admins}</span></div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Vendedores</div>
            <div className={styles.statValue}>{stats.sellers}</div>
          </div>
        </section>

        {/* Control & Search Bar */}
        <section className={styles.controlBar}>
          <div className={styles.filters}>
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={styles.selectFilter}
            >
              <option value="Todos">Todos los roles</option>
              <option value="Administrador">Administrador</option>
              <option value="Vendedor">Vendedor</option>
              <option value="Cliente">Cliente</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className={styles.newUserBtn}
          >
            Nuevo Usuario +
          </button>
        </section>

        {/* Users Table */}
        <section className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre / Email</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    No se encontraron usuarios con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>
                          {user.nombre} {user.apellido}
                        </span>
                        <span className={styles.userEmail}>{user.email}</span>
                      </div>
                    </td>
                    <td>{user.telefono}</td>
                    <td>
                      <span
                        className={`${styles.roleBadge} ${
                          user.rol === "Administrador"
                            ? styles.roleAdmin
                            : user.rol === "Vendedor"
                            ? styles.roleSeller
                            : styles.roleClient
                        }`}
                      >
                        {user.rol}
                      </span>
                    </td>
                    <td>
                      <div className={styles.statusWrapper}>
                        <span
                          className={`${styles.statusDot} ${
                            user.estado === "Activo"
                              ? styles.statusActive
                              : styles.statusInactive
                          }`}
                        />
                        <span className={styles.statusText}>{user.estado}</span>
                      </div>
                    </td>
                    <td>{user.fechaRegistro}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(user)}
                          className={`${styles.btnAction} ${styles.btnEdit}`}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(user)}
                          className={`${styles.btnAction} ${styles.btnDelete}`}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>

      {/* Modal - Create/Edit */}
      {(modalMode === "create" || modalMode === "edit") && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {modalMode === "create" ? "Nuevo Usuario" : "Editar Usuario"}
            </h2>
            
            <form onSubmit={modalMode === "create" ? handleCreateUser : handleEditUser} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nombre</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Apellido</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Pérez"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  required
                  placeholder="juan@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Teléfono</label>
                <input
                  type="tel"
                  required
                  placeholder="555-1234"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Rol</label>
                  <select
                    value={formData.rol}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rol: e.target.value as User["rol"],
                      })
                    }
                    className={styles.select}
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Vendedor">Vendedor</option>
                    <option value="Cliente">Cliente</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estado: e.target.value as User["estado"],
                      })
                    }
                    className={styles.select}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={handleCloseModal} className={styles.btnCancel}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnSubmit}>
                  {modalMode === "create" ? "Crear" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Delete Confirmation */}
      {modalMode === "delete" && selectedUser && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Confirmar Eliminación</h2>
            <p style={{ margin: "16px 0", fontSize: "14px", color: "var(--muted)", lineHeight: "1.5" }}>
              ¿Estás seguro de que deseas eliminar permanentemente al usuario{" "}
              <strong>
                {selectedUser.nombre} {selectedUser.apellido}
              </strong>
              ? Esta acción no se puede deshacer.
            </p>
            <div className={styles.modalActions}>
              <button type="button" onClick={handleCloseModal} className={styles.btnCancel}>
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className={styles.btnSubmit}
                style={{ background: "#ef4444", borderColor: "#ef4444", color: "#fff" }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
