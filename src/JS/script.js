$("document").ready(function () {

    fetchData();
    $(document).on("keyup", "#nameFilter", function(){
        let name = $(this).val().toLowerCase(); 
        let amount = $("#amountFilter").val(); 
        filterByBoth(name, amount); 
    });

    $(document).on("keyup", "#amountFilter", function(){
        let amount = $(this).val(); 
        let name = $("#nameFilter").val().toLowerCase(); 
        filterByBoth(name, amount);
    });

    //select customer to display chart
    $(document).on("click", ".row", function(){
        let customerId = $(this).data("customer-id");
        console.log("selected customer", customerId);
        updateChart(customerId);
        setTimeout(function(){
        $("canvas").css("display", "block")
        })(500);
        
    });

    
});


let customersData = [];
let transactionsData = [];
let chart = null;
async function getCustomers() {
    try {
        const response = await fetch("http://localhost:3000/customers");
        const data = await response.json();
        customersData = data;
        // console.log("fetch customers", customersData);
    }
    catch (err) {
        console.log(err);
    }

}
async function getTransactions() {
    try {
        const response = await fetch("http://localhost:3000/transactions");
        const data = await response.json();
        transactionsData = data;
        // console.log("fetch transactions", transactionsData);

    }
    catch (err) {
        console.log(err);
    }

}

function displayData(customers, transactions) {
    let content = ``;
    customers.forEach(customer => {
        let customerOfTransactions = transactions.filter(transaction => transaction.customer_id == customer.id);
        // console.log(`Customer ${customer.id} Transactions:`, customerOfTransactions); // Debug log
        customerOfTransactions.forEach(transaction => {
            content += `
              <div class="row flex justify-evenly items-center py-3 hover:bg-[#CDE8E5] hover:text-white"  data-customer-id = "${customer.id}">
                    <div class="cell w-[150px] text-center">${customer.id}</div>
                    <div class="cell w-[150px] text-center">${customer.name}</div>
                    <div class="cell w-[150px] text-center">${transaction.date}</div>
                    <div class="cell w-[150px] text-center">${transaction.amount}</div>
                </div>
            `;
        });
    });
    // document.querySelector(".tbody").innerHTML = content;
    // console.log("displayed data", content);
    $(".tbody").html(content);
    
}

function filterByName(name) {
    let result = customersData.filter(customer => customer.name.toLowerCase().includes(name.toLowerCase()));
    return result;
}
function filerByAmount(amount) {
    let result  = transactionsData.filter(transaction => transaction.amount == amount);
    return result;
}

function filterByBoth(name, amount){
    let  filteredNames = customersData;
    let filteredAmounts = transactionsData;
    if(name)
    {
        filteredNames = filterByName(name);
    }
    if(amount)
    {
        filteredAmounts = filerByAmount(amount);        
    }
    displayData(filteredNames, filteredAmounts);

    //chart
    // if(filteredNames.length > 0){
    //     updateChart(filteredNames[0].id);
    // }

}

async function fetchData() {
    await Promise.all([getCustomers(), getTransactions()]);
    // console.log("at fetch data function", customersData)
    // console.log("at fetch data function", transactionsData)
    displayData(customersData, transactionsData);
    
    //display the chart with initial data of your choice
    // if(customersData.length > 0){
    //     // createChart([], []);
    //     updateChart(customersData[0].id);
    // }
}

function createChart(labels, data){
    let ctx  = document.getElementById('transPerDateChart').getContext('2d');
    if(chart){
        chart.destroy();
    }
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Transaction Amount per Date',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                // backgroundColor: 'rgba(75, 192, 192, 0.2)',
                backgroundColor: 'rgba(255, 255, 255)',
                borderWidth: 1,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                
                }
            }
        }
    });
}
function updateChart(customerId){
    let selectedCustomer = transactionsData.filter(transaction => transaction.customer_id === customerId);
    let transactionAmountPerDate = selectedCustomer.reduce((acc, transaction)=>{
        acc[transaction.date] = (acc[transaction.date] || 0) + transaction.amount;
        return acc;
    }, {})
    let labels = Object.keys(transactionAmountPerDate);
    let data = Object.values(transactionAmountPerDate);
    if(chart){
        chart.destroy();
    }
    createChart(labels, data);
}

// fetchData();
