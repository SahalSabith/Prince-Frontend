const products = [
  {
    id: 1,
    name: "Beef Crowich",
    category: "Sandwich",
    price: 5.50,
    image: "https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=300",
    description: "Premium roast beef with fresh vegetables and our special sauce on a buttery croissant."
  },
  {
    id: 2,
    name: "Buttermelt Croissant",
    category: "Pastry",
    price: 4.00,
    image: "https://images.pexels.com/photos/2135/food-france-morning-breakfast.jpg?auto=compress&cs=tinysrgb&w=300",
    description: "Premium butter croissant with a crispy pastry crust and soft inside will melt away on your mouth!"
  },
  {
    id: 3,
    name: "Cereal Cream Donut",
    category: "Donut",
    price: 2.45,
    image: "https://images.pexels.com/photos/867452/pexels-photo-867452.jpeg?auto=compress&cs=tinysrgb&w=300",
    description: "Classic glazed donut topped with crunchy cereal and filled with sweet cream."
  },
  {
    id: 4,
    name: "Cheesy Cheesecake",
    category: "Cake",
    price: 3.75,
    image: "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=300",
    description: "Rich and creamy cheesecake with a buttery graham cracker crust."
  },
  {
    id: 5,
    name: "Cheezy Sourdough",
    category: "Bread",
    price: 4.50,
    image: "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=300",
    description: "Artisan sourdough bread with a blend of premium cheeses baked into the crust."
  },
  {
    id: 6,
    name: "Egg Tart",
    category: "Tart",
    price: 3.25,
    image: "https://images.pexels.com/photos/5953496/pexels-photo-5953496.jpeg?auto=compress&cs=tinysrgb&w=300",
    description: "Flaky pastry crust filled with sweet custard, baked to golden perfection."
  },
  {
    id: 7,
    name: "Grains Pan Bread",
    category: "Bread",
    price: 4.50,
    image: "https://images.pexels.com/photos/137103/pexels-photo-137103.jpeg?auto=compress&cs=tinysrgb&w=300",
    description: "Hearty multigrain bread packed with seeds and whole grains for extra nutrition."
  },
  {
    id: 8,
    name: "Spinchoco Roll",
    category: "Pastry",
    price: 4.00,
    image: "https://images.pexels.com/photos/5468021/pexels-photo-5468021.jpeg?auto=compress&cs=tinysrgb&w=300",
    description: "Chocolate roll with a hint of spinach for a unique flavor combination."
  },
  {
    id: 9,
    name: "Sliced Black Forest",
    category: "Cake",
    price: 5.00,
    image: "https://images.pexels.com/photos/132694/pexels-photo-132694.jpeg?auto=compress&cs=tinysrgb&w=300",
    description: "Classic Black Forest cake with layers of chocolate, cherries, and whipped cream."
  },
  {
    id: 10,
    name: "Solo Floss Bread",
    category: "Bread",
    price: 4.50,
    image: "https://images.pexels.com/photos/1586947/pexels-photo-1586947.jpeg?auto=compress&cs=tinysrgb&w=300",
    description: "Soft bread topped with savory meat floss for a perfect sweet and savory combination."
  },
  {
    id: 11,
    name: "Zoguma Pan Bread",
    category: "Bread",
    price: 4.50,
    image: "https://images.pexels.com/photos/920220/pexels-photo-920220.jpeg?auto=compress&cs=tinysrgb&w=300",
    description: "Traditional pan bread with a soft texture and slightly sweet taste."
  }
];

const categories = [
  { id: 1, name: "All Menu", count: 110, icon: "all" },
  { id: 2, name: "Breads", count: 20, icon: "bread" },
  { id: 3, name: "Cakes", count: 20, icon: "cake" },
  { id: 4, name: "Donuts", count: 20, icon: "donut" },
  { id: 5, name: "Pastries", count: 20, icon: "pastry" },
  { id: 6, name: "Sandwich", count: 20, icon: "sandwich" }
];

export { products, categories };