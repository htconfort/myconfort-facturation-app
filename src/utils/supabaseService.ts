import { supabase } from './supabaseClient';
import type { Database } from './supabaseClient';

// Types pour les entités
type Client = Database['public']['Tables']['clients']['Row'];
type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type Invoice = Database['public']['Tables']['invoices']['Row'];
type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
type InvoiceItem = Database['public']['Tables']['invoice_items']['Row'];
type InvoiceItemInsert = Database['public']['Tables']['invoice_items']['Insert'];
type Product = Database['public']['Tables']['products']['Row'];

// ===== GESTION DES CLIENTS =====

export const clientService = {
  // Créer un nouveau client
  async create(clientData: ClientInsert): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single();

    if (error) {
      console.error('Erreur création client:', error);
      throw new Error(`Impossible de créer le client: ${error.message}`);
    }

    return data;
  },

  // Récupérer tous les clients
  async getAll(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération clients:', error);
      throw new Error(`Impossible de récupérer les clients: ${error.message}`);
    }

    return data || [];
  },

  // Rechercher des clients par nom ou email
  async search(query: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('name');

    if (error) {
      console.error('Erreur recherche clients:', error);
      throw new Error(`Erreur de recherche: ${error.message}`);
    }

    return data || [];
  },

  // Mettre à jour un client
  async update(id: string, updates: Partial<ClientInsert>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour client:', error);
      throw new Error(`Impossible de mettre à jour le client: ${error.message}`);
    }

    return data;
  }
};

// ===== GESTION DES FACTURES =====

export const invoiceService = {
  // Créer une nouvelle facture avec ses articles
  async create(invoiceData: InvoiceInsert, items: InvoiceItemInsert[]): Promise<Invoice> {
    try {
      // Générer un numéro de facture unique
      const invoiceNumber = await this.generateInvoiceNumber();
      
      // Créer la facture
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          ...invoiceData,
          invoice_number: invoiceNumber
        })
        .select()
        .single();

      if (invoiceError) {
        throw new Error(`Erreur création facture: ${invoiceError.message}`);
      }

      // Ajouter les articles
      if (items.length > 0) {
        const itemsWithInvoiceId = items.map(item => ({
          ...item,
          invoice_id: invoice.id
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsWithInvoiceId);

        if (itemsError) {
          // Supprimer la facture si les articles échouent
          await supabase.from('invoices').delete().eq('id', invoice.id);
          throw new Error(`Erreur ajout articles: ${itemsError.message}`);
        }
      }

      console.log('✅ Facture créée avec succès:', invoice.invoice_number);
      return invoice;

    } catch (error) {
      console.error('❌ Erreur création facture complète:', error);
      throw error;
    }
  },

  // Générer un numéro de facture unique
  async generateInvoiceNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `HTC-${currentYear}`;
    
    // Compter les factures de l'année
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .like('invoice_number', `${prefix}%`);

    const nextNumber = (count || 0) + 1;
    return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
  },

  // Récupérer toutes les factures avec leurs articles
  async getAll(): Promise<(Invoice & { items: InvoiceItem[] })[]> {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération factures:', error);
      throw new Error(`Impossible de récupérer les factures: ${error.message}`);
    }

    return invoices?.map(invoice => ({
      ...invoice,
      items: invoice.invoice_items || []
    })) || [];
  },

  // Récupérer une facture par ID
  async getById(id: string): Promise<(Invoice & { items: InvoiceItem[] }) | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erreur récupération facture:', error);
      return null;
    }

    return {
      ...data,
      items: data.invoice_items || []
    };
  },

  // Mettre à jour le statut d'une facture
  async updateStatus(id: string, status: string): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour statut:', error);
      throw new Error(`Impossible de mettre à jour le statut: ${error.message}`);
    }

    return data;
  }
};

// ===== GESTION DES PRODUITS =====

export const productService = {
  // Récupérer tous les produits actifs
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Erreur récupération produits:', error);
      throw new Error(`Impossible de récupérer les produits: ${error.message}`);
    }

    return data || [];
  },

  // Récupérer les produits par catégorie
  async getByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Erreur récupération produits par catégorie:', error);
      throw new Error(`Erreur récupération catégorie: ${error.message}`);
    }

    return data || [];
  },

  // Récupérer les catégories disponibles
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true)
      .order('category');

    if (error) {
      console.error('Erreur récupération catégories:', error);
      return [];
    }

    // Retourner les catégories uniques
    const categories = [...new Set(data?.map(item => item.category) || [])];
    return categories;
  }
};

// ===== FONCTIONS UTILITAIRES =====

// Fonction pour tester la connexion Supabase
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Test connexion Supabase échoué:', error);
      return false;
    }

    console.log('✅ Connexion Supabase réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur test connexion:', error);
    return false;
  }
};

// Export des types pour utilisation externe
export type { Client, ClientInsert, Invoice, InvoiceInsert, InvoiceItem, InvoiceItemInsert, Product };