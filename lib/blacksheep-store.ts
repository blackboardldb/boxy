"use client";

import React from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
// Removed mock-data imports
import type {
  FitCenterUserProfile as User,
  ClassSession,
  Discipline,
  Instructor,
  MembershipPlan as Plan,
  Organization,
  PendingRenewalRequest,
} from "./types";
// Removed UserService import (not needed in client)
// Removed unused import



// NUEVO: Tipo para el estado de paginación
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Modelo de egreso
export type Egreso = {
  id: string;
  motivo: string;
  fecha: string; // ISO date
  monto: number;
};

interface BlackSheepStore {
  // State
  users: User[];
  pagination: PaginationState | null;
  classSessions: ClassSession[];
  disciplines: Discipline[];
  instructors: Instructor[];
  instructorsPagination: PaginationState | null;
  plans: Plan[];
  membershipPlans: Plan[];
  initialOrganization: Organization | null;
  classRegistrations: unknown[];
  membershipRenewals: unknown[];
  selectedUser: User | null;
  searchResults: User[];
  userStats: Record<string, unknown> | null;
  isLoading: boolean;
  error: string | null;

  egresos: Egreso[];



  // User actions
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  fetchUsers: (
    page?: number,
    limit?: number,
    search?: string,
    role?: string,
    status?: string
  ) => Promise<void>;
  fetchUserById: (id: string) => Promise<User | null>;
  createUser: (userData: Partial<User>) => Promise<User | null>;
  updateUserById: (id: string, userData: Partial<User>) => Promise<User | null>;
  deleteUserById: (id: string) => Promise<boolean>;
  searchUsers: (query: string) => Promise<User[]>;
  getUserStats: () => Promise<any>;
  getUsersByMembershipStatus: (status: string) => Promise<User[]>;

  // Class session actions
  addClassSession: (classSession: ClassSession) => void;
  updateClassSession: (classSession: ClassSession) => void;
  deleteClassSession: (classSessionId: string) => void;
  fetchClassSessions: (
    startDate?: string,
    endDate?: string,
    page?: number,
    limit?: number
  ) => Promise<any>;
  fetchUserClasses: (userId: string, startDate?: string, endDate?: string) => Promise<ClassSession[]>;

  // Discipline actions
  addDiscipline: (discipline: Discipline) => void;
  updateDiscipline: (discipline: Discipline) => void;
  deleteDiscipline: (disciplineId: string) => Promise<boolean>;
  createDiscipline: (
    disciplineData: Partial<Discipline>
  ) => Promise<Discipline | null>;
  updateDisciplineById: (
    id: string,
    disciplineData: Partial<Discipline>
  ) => Promise<Discipline | null>;
  fetchDisciplines: (
    page?: number,
    limit?: number,
    isActive?: string
  ) => Promise<void>;

  // Instructor actions
  addInstructor: (instructor: Instructor) => void;
  updateInstructor: (instructor: Instructor) => void;
  deleteInstructor: (instructorId: string) => void;
  createInstructor: (
    instructorData: Partial<Instructor>
  ) => Promise<Instructor | null>;
  updateInstructorById: (
    id: string,
    instructorData: Partial<Instructor>
  ) => Promise<Instructor | null>;
  deleteInstructorById: (id: string) => Promise<boolean>;
  toggleInstructorStatus: (id: string) => Promise<boolean>;
  fetchInstructors: (
    page?: number,
    limit?: number,
    search?: string,
    role?: string,
    isActive?: string
  ) => Promise<void>;

  // Plan actions
  addPlan: (plan: Plan) => void;
  updatePlan: (plan: Plan) => void;
  deletePlan: (planId: string) => void;
  createPlan: (planData: Partial<Plan>) => Promise<Plan | null>;
  updatePlanById: (id: string, planData: Partial<Plan>) => Promise<Plan | null>;
  deletePlanById: (id: string) => Promise<boolean>;
  fetchPlans: (
    page?: number,
    limit?: number,
    search?: string,
    isActive?: string
  ) => Promise<void>;

  // Organization actions
  updateOrganization: (organization: Organization) => Promise<boolean>;
  fetchOrganization: () => Promise<void>;

  // Registration actions
  addClassRegistration: (registration: unknown) => void;
  updateClassRegistration: (registration: unknown) => void;
  deleteClassRegistration: (registrationId: string) => void;
  fetchClassRegistrations: () => void;

  // Renewal actions
  addMembershipRenewal: (renewal: unknown) => void;
  updateMembershipRenewal: (renewal: unknown) => void;
  deleteMembershipRenewal: (renewalId: string) => void;
  fetchMembershipRenewals: () => void;
  requestPlanRenewal: (
    userId: string,
    planId: string,
    paymentMethod: string
  ) => Promise<void>;



  // Egreso actions
  fetchEgresos: (year?: number, month?: number) => Promise<void>;
  addEgreso: (egreso: Omit<Egreso, "id">) => Promise<void>;
  deleteEgreso: (id: string) => Promise<void>;

  // Provider management actions
  getProviderHealth: () => Promise<any>;
}

export const useBlackSheepStore = create<BlackSheepStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      users: [],
      pagination: null,
      classSessions: [],
      disciplines: [],
      instructors: [],
      instructorsPagination: null,
      plans: [],
      membershipPlans: [],
      initialOrganization: null,
      classRegistrations: [],
      membershipRenewals: [],
      selectedUser: null,
      searchResults: [],
      userStats: null,
      isLoading: false,
      error: null,

      egresos: [],

      // User actions
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      updateUser: (user) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === user.id ? user : u)),
        })),
      deleteUser: (userId) =>
        set((state) => ({
          users: state.users.filter((u) => u.id !== userId),
        })),
      fetchUsers: async (
        page = 1,
        limit = 10,
        search = "",
        role = "",
        status = ""
      ) => {
        try {
          set({ isLoading: true, error: null });
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          if (search) params.append("search", search);
          if (role) params.append("role", role);
          if (status) params.append("status", status);

          const response = await fetch(`/api/users?${params.toString()}`);
          if (!response.ok) throw new Error("Failed to fetch users");
          
          const result = await response.json();
          if (result.success) {
            set({
              users: result.data,
              pagination: result.meta?.pagination || result.pagination,
            });
          } else {
            throw new Error(result.error?.message || "Error fetching users");
          }
        } catch (error) {
          console.error("Error fetching users:", error);
          set({
            users: [],
            pagination: null,
            error: error instanceof Error ? error.message : String(error),
          });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchUserById: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/users/${id}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || errorData.message || "Error fetching user");
          }
          
          const result = await response.json();

          if (result.success && result.data) {
            set({ selectedUser: result.data });
            return result.data;
          } else {
            throw new Error(result.error?.message || "Error fetching user");
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          set({
            selectedUser: null,
            error: error instanceof Error ? error.message : String(error),
          });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      createUser: async (userData: Partial<User>) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || errorData.message || "Error creating user");
          }
          
          const result = await response.json();

          if (result.success) {
            set((state) => ({
              users: [...state.users, result.data],
            }));
            return result.data;
          } else {
            throw new Error(result.error?.message || "Error creating user");
          }
        } catch (error) {
          console.error("Error creating user:", error);
          set({
            error: error instanceof Error ? error.message : String(error),
          });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      updateUserById: async (id: string, userData: Partial<User>) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/users/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || errorData.message || "Error updating user");
          }
          
          const result = await response.json();

          if (result.success) {
            set((state) => ({
              users: state.users.map((user) =>
                user.id === id ? { ...user, ...result.data } : user
              ),
              selectedUser:
                state.selectedUser?.id === id
                  ? { ...state.selectedUser, ...result.data }
                  : state.selectedUser,
            }));
            return result.data;
          } else {
            throw new Error(result.error?.message || "Error updating user");
          }
        } catch (error) {
          console.error("Error updating user:", error);
          set({
            error: error instanceof Error ? error.message : String(error),
          });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteUserById: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/users/${id}`, {
            method: "DELETE",
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || errorData.message || "Error deleting user");
          }
          
          const result = await response.json();

          if (result.success) {
            set((state) => ({
              users: state.users.filter((user) => user.id !== id),
              selectedUser:
                state.selectedUser?.id === id ? null : state.selectedUser,
            }));
            return true;
          } else {
            throw new Error(result.error?.message || "Error deleting user");
          }
        } catch (error) {
          console.error("Error deleting user:", error);
          set({
            error: error instanceof Error ? error.message : String(error),
          });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      searchUsers: async (query: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const params = new URLSearchParams({ search: query, limit: "50" });
          const response = await fetch(`/api/users?${params.toString()}`);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || errorData.message || "Error searching users");
          }
          
          const result = await response.json();

          if (result.success) {
            set({ searchResults: result.data });
            return result.data;
          } else {
            throw new Error(result.error?.message || "Error searching users");
          }
        } catch (error) {
          console.error("Error searching users:", error);
          set({
            searchResults: [],
            error: error instanceof Error ? error.message : String(error),
          });
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      getUserStats: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch("/api/users/stats");
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || errorData.message || "Error fetching user stats");
          }
          
          const result = await response.json();

          if (result.success) {
            set({ userStats: result.data });
            return result.data;
          } else {
            throw new Error(
              result.error?.message || "Error fetching user stats"
            );
          }
        } catch (error) {
          console.error("Error fetching user stats:", error);
          set({
            userStats: null,
            error: error instanceof Error ? error.message : String(error),
          });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      getUsersByMembershipStatus: async (status: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const params = new URLSearchParams({ status, limit: "100" });
          const response = await fetch(`/api/users?${params.toString()}`);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || errorData.message || "Error fetching users by status");
          }
          
          const result = await response.json();

          if (result.success) {
            return result.data;
          } else {
            throw new Error(
              result.error?.message || "Error fetching users by status"
            );
          }
        } catch (error) {
          console.error("Error fetching users by status:", error);
          set({
            error: error instanceof Error ? error.message : String(error),
          });
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      // Class session actions
      addClassSession: (classSession) =>
        set((state) => ({
          classSessions: [...state.classSessions, classSession],
        })),
      updateClassSession: (classSession) =>
        set((state) => ({
          classSessions: state.classSessions.map((cs) =>
            cs.id === classSession.id ? classSession : cs
          ),
        })),
      deleteClassSession: (classSessionId) =>
        set((state) => ({
          classSessions: state.classSessions.filter(
            (cs) => cs.id !== classSessionId
          ),
        })),
      fetchClassSessions: async (
        startDate?: string,
        endDate?: string,
        page: number = 1,
        limit: number = 100,
        filters?: { status?: string; orderBy?: "asc" | "desc" }
      ) => {
        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          if (startDate) params.append("startDate", startDate);
          if (endDate) params.append("endDate", endDate);
          if (filters?.status) params.append("status", filters.status);
          // Note: the current API might not support 'orderBy' directly as a query param 
          // but we can pass it through anyway or handle it in the service if we update it.
          // For now, let's just ensure we can at least filter by status.

          const response = await fetch(`/api/classes?${params.toString()}`);
          if (!response.ok) {
            throw new Error("Failed to fetch classes");
          }

          const result = await response.json();
          if (result.success) {
            // Merge or set? Usually set for small datasets like current week/active alerts
            set({ classSessions: result.data || [] });
            return {
              classes: result.data || [],
              pagination: result.meta?.pagination || result.pagination
            };
          } else {
            throw new Error(result.error?.message || "Error fetching classes");
          }
        } catch (error) {
          console.error("Error fetching class sessions:", error);
          // Punto 1: No limpiar el store en caso de error para evitar que la UI quede vacía (Flicker)
          return { classes: [], pagination: null };
        }
      },
      fetchUserClasses: async (userId: string, startDate?: string, endDate?: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const params = new URLSearchParams();
          if (startDate) params.append("startDate", startDate);
          if (endDate) params.append("endDate", endDate);
          
          const queryString = params.toString();
          const url = `/api/users/${userId}/classes${queryString ? `?${queryString}` : ""}`;

          const response = await fetch(url);
          if (!response.ok) {
            const errorMsg = await response.json().catch(() => ({})).then(r => r.error?.message || r.message || "Unknown error");
            throw new Error(`Failed to fetch user classes: ${errorMsg}`);
          }
          
          const result = await response.json();
          if (result.success) {
            set({ classSessions: result.data || [] });
            return result.data || [];
          } else {
            throw new Error(result.error?.message || "Error fetching user classes");
          }
        } catch (error) {
          console.error("Error fetching user classes:", error);
          set({ classSessions: [] });
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      // Discipline actions
      addDiscipline: (discipline: Discipline) =>
        set((state) => ({ disciplines: [...state.disciplines, discipline] })),
      updateDiscipline: (discipline: Discipline) =>
        set((state) => ({
          disciplines: state.disciplines.map((d) =>
            d.id === discipline.id ? discipline : d
          ),
        })),
      deleteDiscipline: async (disciplineId: string) => {
        try {
          // Intentar borrar desde la API real
          const response = await fetch(`/api/disciplines/${disciplineId}`, {
            method: "DELETE",
          });
          if (!response.ok) {
            const errorResult = await response.json();
            console.error("No se pudo borrar desde la API:", errorResult);
            alert(errorResult.error?.message || errorResult.message || "No se pudo eliminar la disciplina. Probablemente esté en uso.");
            // No lo eliminamos localmente si falló en el backend
            return false;
          }

          // Si tuvo éxito, se elimina de la UI de forma asíncrona pero visible
          set((state) => ({
            disciplines: state.disciplines.filter((d) => d.id !== disciplineId),
          }));
          return true;
        } catch (error) {
          console.error("Error eliminando disciplina de la API:", error);
          alert("Error de conexión al eliminar la disciplina.");
          return false;
        }
      },
      fetchDisciplines: async (page = 1, limit = 50, isActive = "") => {
        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          if (isActive) params.append("isActive", isActive);

          const response = await fetch(`/api/disciplines?${params.toString()}`);
          if (!response.ok) throw new Error("Failed to fetch disciplines");

          const data = await response.json();
          set({ disciplines: data.data });
        } catch (error) {
          console.error("Error fetching disciplines:", error);
          set({ disciplines: [] });
        }
      },

      createDiscipline: async (disciplineData: Partial<Discipline>) => {
        try {
          set({ isLoading: true, error: null });
          
          // Eliminar ID vacío para permitir que la BD (Prisma) lo autogenere
          const payload = { ...disciplineData };
          if (!payload.id) {
            delete payload.id;
          }
          
          const response = await fetch("/api/disciplines", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || errorData.message || "Error creating discipline");
          }

          const data = await response.json();
          const newDiscipline = data.data || data.discipline;
          set((state) => ({
            disciplines: [...state.disciplines, newDiscipline],
          }));
          return newDiscipline;
        } catch (error) {
          console.error("Error creating discipline:", error);
          set({
            error: error instanceof Error ? error.message : String(error),
          });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      updateDisciplineById: async (
        id: string,
        disciplineData: Partial<Discipline>
      ) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`/api/disciplines/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(disciplineData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error updating discipline");
          }

          const data = await response.json();
          const updatedDiscipline = data.data || data.discipline;
          set((state) => ({
            disciplines: state.disciplines.map((discipline) =>
              discipline.id === id
                ? { ...discipline, ...updatedDiscipline }
                : discipline
            ),
          }));
          return updatedDiscipline;
        } catch (error) {
          console.error("Error updating discipline:", error);
          set({
            error: error instanceof Error ? error.message : String(error),
          });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      // Instructor actions
      addInstructor: (instructor) =>
        set((state) => ({ instructors: [...state.instructors, instructor] })),
      updateInstructor: (instructor) =>
        set((state) => ({
          instructors: state.instructors.map((i) =>
            i.id === instructor.id ? instructor : i
          ),
        })),
      deleteInstructor: (instructorId) =>
        set((state) => ({
          instructors: state.instructors.filter((i) => i.id !== instructorId),
        })),
      fetchInstructors: async (
        page = 1,
        limit = 10,
        search = "",
        role = "",
        isActive = ""
      ) => {
        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          if (search) params.append("search", search);
          if (role) params.append("role", role);
          if (isActive) params.append("isActive", isActive);

          const response = await fetch(`/api/instructors?${params.toString()}`);
          if (!response.ok) throw new Error("Failed to fetch instructors");

          const data = await response.json();
          set({
            instructors: data.data,
            instructorsPagination: data.pagination,
          });
        } catch (error) {
          console.error("Error fetching instructors:", error);
          set({ instructors: [], instructorsPagination: null });
        }
      },

      createInstructor: async (instructorData: Partial<Instructor>) => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch("/api/instructors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(instructorData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            const errorMessage =
              errorData.error?.message ||
              errorData.message ||
              JSON.stringify(errorData.error) ||
              "Error creating instructor";
            throw new Error(errorMessage);
          }

          const data = await response.json();

          set((state) => ({
            instructors: [
              ...state.instructors,
              data.data || data.instructor || data,
            ],
          }));
          return data.data || data.instructor || data;
        } catch (error) {
          console.error("Error creating instructor:", error);
          set({
            error: error instanceof Error ? error.message : String(error),
          });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      updateInstructorById: async (
        id: string,
        instructorData: Partial<Instructor>
      ) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`/api/instructors/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(instructorData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error?.message ||
                errorData.message ||
                "Error updating instructor"
            );
          }

          const data = await response.json();
          set((state) => ({
            instructors: state.instructors.map((instructor) =>
              instructor.id === id
                ? { ...instructor, ...data.data }
                : instructor
            ),
          }));
          return data.data;
        } catch (error) {
          console.error("Error updating instructor:", error);
          set({
            error: error instanceof Error ? error.message : String(error),
          });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteInstructorById: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`/api/instructors/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error?.message ||
                errorData.message ||
                "Error deleting instructor"
            );
          }

          set((state) => ({
            instructors: state.instructors.filter(
              (instructor) => instructor.id !== id
            ),
          }));
          return true;
        } catch (error) {
          console.error("Error deleting instructor:", error);
          set({
            error: error instanceof Error ? error.message : String(error),
          });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      toggleInstructorStatus: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`/api/instructors/${id}/status`, {
            method: "PATCH",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error?.message ||
                errorData.message ||
                "Error toggling instructor status"
            );
          }

          const data = await response.json();
          set((state) => ({
            instructors: state.instructors.map((instructor) =>
              instructor.id === id
                ? { ...instructor, isActive: data.data.isActive }
                : instructor
            ),
          }));
          return true;
        } catch (error) {
          console.error("Error toggling instructor status:", error);
          set({
            error: error instanceof Error ? error.message : String(error),
          });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Plan actions
      addPlan: (plan) => set((state) => ({ plans: [...state.plans, plan] })),
      updatePlan: (plan) =>
        set((state) => ({
          plans: state.plans.map((p) => (p.id === plan.id ? plan : p)),
        })),
      deletePlan: (planId) =>
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== planId),
        })),
      fetchPlans: async (page = 1, limit = 10, search = "", isActive = "") => {
        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          if (search) params.append("search", search);
          if (isActive) params.append("isActive", isActive);

          const response = await fetch(`/api/plans?${params.toString()}`);
          if (!response.ok) throw new Error("Failed to fetch plans");

          const data = await response.json();
          console.log("API response for fetchPlans:", data);

          // Handle different response structures
          const plans = data.data || data.plans || data || [];

          // Ensure all plans have required properties
          const validPlans = plans.filter(
            (plan: Plan) => plan && plan.id && plan.name
          );

          set({ plans: validPlans, membershipPlans: validPlans });
        } catch (error) {
          console.error("Error fetching plans:", error);
          set({ plans: [], membershipPlans: [] });
        }
      },

      createPlan: async (planData: Partial<Plan>) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch("/api/plans", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(planData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error creating plan");
          }

          const data = await response.json();
          console.log("API response for createPlan:", data);

          // Handle different response structures
          const newPlan = data.data || data.plan || data;

          if (!newPlan || !newPlan.id) {
            throw new Error("Invalid plan data received from API");
          }

          set((state) => ({
            plans: [...(state.plans || []), newPlan],
          }));
          return newPlan;
        } catch (error) {
          console.error("Error creating plan:", error);
          set({
            error: error instanceof Error ? error.message : String(error),
          });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      updatePlanById: async (id: string, planData: Partial<Plan>) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`/api/plans/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(planData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error updating plan");
          }

          const data = await response.json();
          console.log("API response for updatePlan:", data);

          // Handle different response structures
          const updatedPlan = data.data || data.plan || data;

          if (!updatedPlan || !updatedPlan.id) {
            throw new Error("Invalid plan data received from API");
          }

          set((state) => ({
            plans: state.plans.map((plan) =>
              plan.id === id ? { ...plan, ...updatedPlan } : plan
            ),
          }));
          return updatedPlan;
        } catch (error) {
          console.error("Error updating plan:", error);
          set({
            error: error instanceof Error ? error.message : String(error),
          });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      deletePlanById: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`/api/plans/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error?.message ||
                errorData.message ||
                "Error deleting plan. Possibly in use."
            );
          }

          set((state) => ({
            plans: state.plans.filter((plan) => plan.id !== id),
            membershipPlans: state.membershipPlans.filter((plan) => plan.id !== id),
          }));
          return true;
        } catch (error) {
          console.error("Error deleting plan:", error);
          set({
            error: error instanceof Error ? error.message : String(error),
          });
          throw error; // Throw so component can handle it
        } finally {
          set({ isLoading: false });
        }
      },

      // Organization actions
      updateOrganization: async (organization) => {
        try {
          set({ isLoading: true });
          const response = await fetch("/api/organization", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(organization),
          });

          if (!response.ok)
            throw new Error("Error al actualizar organización");

          const result = await response.json();
          if (result.success) {
            set({ initialOrganization: result.data });
            return true;
          }
          return false;
        } catch (error) {
          console.error("Error updating organization:", error);
          set({ error: String(error) });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      fetchOrganization: async () => {
        try {
          set({ isLoading: true });
          const response = await fetch("/api/organization");
          if (!response.ok) throw new Error("Error al obtener organización");

          const result = await response.json();
          if (result.success && result.data) {
            set({ initialOrganization: result.data });
          }
        } catch (error) {
          console.error("Error fetching organization:", error);
          set({ initialOrganization: null });
        } finally {
          set({ isLoading: false });
        }
      },

      // Registration actions
      addClassRegistration: (registration) =>
        set((state) => ({
          classRegistrations: [...state.classRegistrations, registration],
        })),
      updateClassRegistration: (registration) =>
        set((state) => ({
          classRegistrations: state.classRegistrations.map((cr) => {
            const r = cr as any;
            const reg = registration as any;
            return r.userId === reg.userId && r.classSessionId === reg.classSessionId
              ? registration
              : cr;
          }),
        })),
      deleteClassRegistration: (registrationId) =>
        set((state) => ({
          classRegistrations: state.classRegistrations.filter(
            (cr) => (cr as any).userId !== registrationId
          ),
        })),
      fetchClassRegistrations: () => {
        // En una app real esto vendría de la API real, por ahora lo mantenemos vacío para no romper tipos
        set({ classRegistrations: [] });
      },

      // Renewal actions
      addMembershipRenewal: (renewal) =>
        set((state) => ({
          membershipRenewals: [...state.membershipRenewals, renewal],
        })),
      updateMembershipRenewal: (renewal) =>
        set((state) => ({
          membershipRenewals: state.membershipRenewals.map((mr) =>
            (mr as any).id === (renewal as any).id ? renewal : mr
          ),
        })),
      deleteMembershipRenewal: (renewalId) =>
        set((state) => ({
          membershipRenewals: state.membershipRenewals.filter(
            (mr) => (mr as any).id !== renewalId
          ),
        })),
      fetchMembershipRenewals: () => {
        // En una app real esto vendría de la API real, por ahora lo mantenemos vacío para no romper tipos
        set({ membershipRenewals: [] });
      },

      requestPlanRenewal: async (
        userId: string,
        planId: string,
        paymentMethod: string
      ) => {
        try {
          set({ isLoading: true, error: null });

          // Buscar el plan seleccionado
          const selectedPlan = get().plans.find(p => p.id === planId);
          if (!selectedPlan) {
            // Si no está en el store, intentar cargarlos
            await get().fetchPlans();
            const reloadedPlan = get().plans.find(p => p.id === planId);
            if (!reloadedPlan) throw new Error(`Plan con ID ${planId} no encontrado`);
          }
          
          const plan = get().plans.find(p => p.id === planId)!;

          // Buscar el usuario en el store
          let targetUser = get().users.find((u) => u.id === userId);
          
          // Si no está en el store (por paginación), obtenerlo de la API
          if (!targetUser) {
            targetUser = await get().fetchUserById(userId) || undefined;
          }

          if (!targetUser) {
            throw new Error(`Usuario con ID ${userId} no encontrado`);
          }

          // Crear objeto de solicitud de renovación
          const renewalRequest: PendingRenewalRequest = {
            id: `renewal_${Date.now()}`,
            requestedPlanId: planId,
            requestedPaymentMethod: paymentMethod as any,
            requestDate: new Date().toISOString(),
            status: "pending",
            requestedBy: userId,
            notes: "",
            // Campos adicionales para facilitar visualización en admin
            ...({
              requestedPlanName: plan.name,
              requestedPlanPrice: plan.price,
              requestedPlanClassLimit: plan.classLimit,
              requestedPlanDuration: plan.durationInMonths,
            } as any)
          };

          // Preparar la actualización de la membresía
          const updatedMembership = {
            ...targetUser.membership,
            pendingRenewal: renewalRequest,
          };

          // Usar updateUserById que ya maneja la llamada a la API y actualización del store
          const result = await get().updateUserById(userId, { 
            membership: updatedMembership 
          });

          if (!result) {
            throw new Error("No se pudo guardar la solicitud de renovación en el servidor");
          }

          // Actualizar registros de renovaciones locales si es necesario
          set((state) => ({
            membershipRenewals: [...state.membershipRenewals, renewalRequest],
          }));

          console.log("Renovación solicitada exitosamente:", renewalRequest);
        } catch (error) {
          console.error("Error requesting plan renewal:", error);
          set({
            error: error instanceof Error ? error.message : String(error),
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },



      // Egreso actions
      fetchEgresos: async (year?: number, month?: number) => {
        try {
          const params = new URLSearchParams();
          if (year !== undefined) params.append("year", year.toString());
          if (month !== undefined) params.append("month", month.toString());
          
          const url = `/api/expenses${params.toString() ? `?${params.toString()}` : ""}`;
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              set({ egresos: data.data });
            }
          }
        } catch (error) {
          console.error("Error al obtener egresos de la API:", error);
        }
      },
      addEgreso: async (egreso) => {
        try {
          const response = await fetch("/api/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(egreso),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              set((state) => ({
                egresos: [...state.egresos, data.data],
              }));
              return;
            }
          }
          throw new Error("No se pudo agregar el egreso a la API");
        } catch (error) {
          console.error("Error al agregar egreso de la API:", error);
          throw error;
        }
      },
      deleteEgreso: async (id) => {
        try {
          const response = await fetch(`/api/expenses/${id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              set((state) => ({
                egresos: state.egresos.filter((e) => e.id !== id),
              }));
              return;
            }
          }
          throw new Error("No se pudo eliminar el egreso de la API");
        } catch (error) {
          console.error("Error al eliminar egreso de la API:", error);
          throw error;
        }
      },
    }),
    {
      name: "blacksheep-store",
    }
  )
);

// ========================================================================================
// Selector hooks for common data access patterns
// ========================================================================================

export const useActiveUsers = () =>
  useBlackSheepStore((state) =>
    state.users.filter((user) => user.membership?.status === "active")
  );

export const usePendingUsers = () =>
  useBlackSheepStore((state) =>
    state.users.filter((user) => user.membership?.status === "pending")
  );

export const useExpiredUsers = () =>
  useBlackSheepStore((state) =>
    state.users.filter((user) => user.membership?.status === "expired")
  );

export const useUserStats = () =>
  useBlackSheepStore((state) => {
    const users = state.users;
    const totalUsers = users?.length || 0;
    const activeUsers =
      users?.filter((user) => user.membership?.status === "active").length || 0;
    const pendingUsers =
      users?.filter((user) => user.membership?.status === "pending").length ||
      0;
    const expiredUsers =
      users?.filter((user) => user.membership?.status === "expired").length ||
      0;

    return {
      total: totalUsers,
      active: activeUsers,
      pending: pendingUsers,
      expired: expiredUsers,
    };
  });

export const useClassesForDate = (date: Date) =>
  useBlackSheepStore((state) =>
    state.classSessions.filter((session) => {
      const sessionDate = new Date(session.dateTime);
      return (
        sessionDate.getDate() === date.getDate() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      );
    })
  );

export const useCurrentUser = (userId?: string) =>
  useBlackSheepStore((state) =>
    userId ? state.users.find((user) => user.id === userId) : null
  );

export const useActiveDisciplines = () =>
  useBlackSheepStore((state) =>
    state.disciplines.filter((discipline) => discipline.isActive)
  );



// ========================================================================================
// Constants for UI components
// ========================================================================================

export const STUDENT_STATES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  SCHEDULED: "scheduled",
} as const;

export const STATE_COLORS = {
  active: "#10b981", // Green
  inactive: "#6b7280", // Gray
  pending: "#f59e0b", // Orange
  scheduled: "#0ea5e9", // Blue
} as const;
