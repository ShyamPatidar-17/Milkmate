
const sampleCustomer= [
    {
      first: 'Ajay',
      last: 'Rawat',
      contact: 8269105163,
      address: '123 Main St, Springfield, IL 62701',
      code: 1001,
    },
    {
      first: 'Vijay',
      last:'Kumar',
      contact:7771030602,
      address: '456 Oak St, Chicago, IL 60601',
      code: 1002,
    },
    {
      first: 'Jeevan',
      last:'Singh',
      contact:9009006088,
      address: '789 Pine St, Urbana, IL 61801',
      code:1003,
    },
    {
      first: 'Vikram',
      last:'Rathore',
      contact:9109672736,
      address: '101 Elm St, Decatur, IL 62521',
      code:1004,
    },
    {
      first:'Jaydev',
      last:'Patil',
      contact:6265806198,
      address: '202 Maple St, Champaign, IL 61820',
      code:1005,
    },
  ];

//  module.exports={data1:sampleCustomer};

  const dairyUser=[
    {
      fullName: "Akash Chouhan",
      dairyName: "Sanchi Dairy ",
      dairyAddress: "Ujjain,453111",
      email: "akash@gmail.com",
      contact:147852369,
      password: "password147",
      confirmPassword: "password147"
    },
    {
      fullName: "Kamal Chouhan",
      dairyName: "Kamal Fresh MIlk Dairy",
      dairyAddress: "789 Cow Road, Milk Town, MT 23456",
      email: "kamal@gmail.com",
      contact:123456789,
      password: "password123",
      confirmPassword: "password123"
    },
    {
      fullName: "Arpit Kumar",
      dairyName: "Arpit Milk house",
      dairyAddress: "101 Dairy Blvd, Cream City, CC 34567",
      email: "arpit@gmail.com",
      contact:456321789,
      password: "password456",
      confirmPassword: "password456"
    },
  ]

  // module.exports={data2:dairyUser};
  
  const milkmanData = [
    {
        name: "Ravi Kumar",
        contact: 9876543210,
        email:"ravi@gmail.com",
        address: "123 Milk Colony",
        password: "ravi1234",
        confirmPassword:"ravi1234",

    },
    {
        name: "Priya Sharma",
        contact: 9123456789,
        email:"priya@gmail.com",
        address: "456 Dairy Road",
        password: "priya5678",
        confirmPassword:"priya5678",
    },
    {
        name: "Amit Verma",
        contact: 9988776655,
        email:"amit@gmail.com",
        address: "789 Butter Lane",
        password: "amit2025",
        confirmPassword:"amit2025",
    }
];

// module.exports={data3:milkmanData};

const customerrData = [
  {
      name: "Anjali Patel",
      contact: 9876543210,
      email:"anjali@gmail.com",
      address: "1234 Milk Nagar",
      password: "anjali123",
      confirmPassword: "anjali123"
  },
  {
      name: "Sandeep Reddy",
      contact: 9123456789,
      email:"sandeep@gmail.com",
      address: "5678 Dairy Complex",
      password: "sandeep567",
      confirmPassword: "sandeep567"
  },
  {
      name: "Neha Singh",
      contact: 9988776655,
      email:"neha@gmail.com",
      address: "4321 Butter Park",
      password: "neha2025",
      confirmPassword: "neha2025"
  }
];


// module.exports={data4:customerrData};


//Addmilk data
const milkData = [
  {
    code: 101,
    date:Date.now(),
    shift: 'M',
    liter: 10.5,
    rate: 3.5,
    amount: 36.75,
    total_ltr: 100.5,
    total_amount: 350.75
  },
  {
    code: 102,
    date: new Date('2025-03-02'),
    shift: 'E',
    liter: 8.0,
    rate: 3.2,
    amount: 25.60,
    total_ltr: 80.0,
    total_amount: 256.00
  },
  {
    code: 103,
    date: new Date('2025-03-03'),
    shift: 'M',
    liter: 12.0,
    rate: 3.8,
    amount: 45.60,
    total_ltr: 120.0,
    total_amount: 456.00
  },
  {
    code: 104,
    date: new Date('2025-03-04'),
    shift: 'E',
    liter: 15.0,
    rate: 4.0,
    amount: 60.00,
    total_ltr: 150.0,
    total_amount: 600.00
  },
  {
    code: 105,
    date: new Date('2025-03-05'),
    shift: 'M',
    liter: 20.0,
    rate: 3.7,
    amount: 74.00,
    total_ltr: 200.0,
    total_amount: 740.00
  }
];

module.exports={data5:milkData};
