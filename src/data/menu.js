// Reference Images generated specifically for the Urban theme
const BURGER_IMG = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop";
const RAMEN_IMG = "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop";
const TACOS_IMG = "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800&auto=format&fit=crop";

export const menuCategories = [
  {
    id: 'entradas',
    name: 'Entradas // Starters',
    items: [
      {
        id: 1,
        name: "Tacos de Pulpo Grill",
        description: "Pulpo al carbón, emulsión de chipotle, piña asada y tortilla de maíz morado.",
        price: "$18",
        image: TACOS_IMG
      },
      {
        id: 4,
        name: "Gyozas Urbanas",
        description: "Rellenas de cerdo y cebollino con salsa ponzu picante y sésamo negro.",
        price: "$14",
        image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?q=80&w=800&auto=format&fit=crop"
      },
      {
        id: 5,
        name: "Carpaccio de Remolacha",
        description: "Láminas finas de remolacha asada, queso de cabra, nueces y vinagreta de miel.",
        price: "$12",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop"
      }
    ]
  },
  {
    id: 'fuertes',
    name: 'Platos Fuertes // Mains',
    items: [
      {
        id: 12,
        name: "Burger 'The Architect'",
        description: "Wagyu A5, cheddar envejecido, cebolla caramelizada al bourbon y pan brioche artesanal.",
        price: "$22",
        image: BURGER_IMG
      },
      {
        id: 2,
        name: "Street Style Ramen",
        description: "Caldo de 24 horas, chashu de cerdo ibérico, huevo ajitsuke y aceite de chili urbano.",
        price: "$19",
        image: RAMEN_IMG
      },
      {
        id: 6,
        name: "Salmón al Miso",
        description: "Glaseado con miso, puré de guisantes y espárragos trigueros al grill.",
        price: "$24",
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=800&auto=format&fit=crop"
      }
    ]
  },
  {
    id: 'postres',
    name: 'Postres // Sweets',
    items: [
      {
        id: 7,
        name: "Cheesecake de Matcha",
        description: "Base de galleta artesanal, crema de matcha y frutos rojos frescos.",
        price: "$10",
        image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop"
      },
      {
        id: 8,
        name: "Mousse de Chocolate 70%",
        description: "Chocolate amargo, sal volcánica y aceite de oliva virgen extra.",
        price: "$9",
        image: "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?q=80&w=800&auto=format&fit=crop"
      }
    ]
  },
  {
    id: 'bebidas',
    name: 'Bebidas // Drinks',
    items: [
      {
        id: 9,
        name: "Gin Tonic Urbano",
        description: "Gin premium, tónica artesanal, pepino y cardamomo.",
        price: "$12",
        image: "https://images.unsplash.com/photo-1547595628-c61a29f496f0?q=80&w=800&auto=format&fit=crop"
      },
      {
        id: 10,
        name: "Limonada de Carbón",
        description: "Limón siciliano, carbón activado y jarabe de agave.",
        price: "$7",
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop"
      }
    ]
  },
  {
    id: 'vinos',
    name: 'Vinos // Wine List',
    items: [
      {
        id: 11,
        name: "Malbec Reserva",
        description: "Tinto con cuerpo, notas de ciruela y vainilla.",
        price: "$45",
        image: "https://images.unsplash.com/photo-1510850478944-75487df11b7a?q=80&w=800&auto=format&fit=crop"
      },
      {
        id: 12,
        name: "Chardonnay Barrel",
        description: "Blanco elegante con toques de roble y manzana verde.",
        price: "$38",
        image: "https://images.unsplash.com/photo-1553361371-9bb223b33658?q=80&w=800&auto=format&fit=crop"
      }
    ]
  }
];
