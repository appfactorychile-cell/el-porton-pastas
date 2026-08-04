window.restaurantConfig = Object.freeze({
  whatsapp: '56933551041',
  siteUrl: 'https://appfactorychile-cell.github.io/el-porton-pastas/',
  products: [
    { id:'pesto', category:'pasta', name:'Fettuccine al pesto', price:5990, description:'Fettuccine artesanal acompañado de pesto y aroma fresco de albahaca.' },
    { id:'champinones', category:'pasta', name:'Fettuccine con champiñones', price:5990, description:'Fettuccine artesanal con salsa cremosa de champiñones.' },
    { id:'mozzarella', category:'pasta', name:'Fettuccine con mozzarella', price:5990, description:'Fettuccine artesanal con una salsa suave y cremosa de mozzarella.' },
    { id:'bowl', category:'bowl', name:'Bowl de ensalada', price:5500, description:'Lechuga, pepino, arroz, choclo, apio, zanahoria, morrón y cebolla morada.' }
  ],
  doughs: [{name:'Tradicional',price:5990},{name:'Betarraga',price:5990},{name:'Albahaca',price:5990},{name:'Mixta',price:6990}],
  proteins: ['Pollo trozado','2 huevos cocidos'],
  mayos: ['Mayonesa de albahaca','Mayonesa con ajo','Mayonesa con merkén','Mayonesa de apio y perejil'],
  delivery: { area:'Talcahuano plano', oneUnit:1000, freeFrom:2 },
  preparationMinutes: 45,
  payments: {
    methods:['Efectivo','Transferencia'], titular:'J-DECH COMERCIALIZADORA SPA', rut:'77.905.422-5', bank:'Mercado Pago', accountType:'Cuenta Vista', account:'1019057759', email:'jdechcomercializadora@gmail.com'
  }
});
