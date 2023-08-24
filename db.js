import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';

const db = await sqlite.open({
    filename: './price-plans.db',
    driver: sqlite3.Database
});

await db.migrate()

// Return a list of all the available price plans.

export async function getPricePlans() {
    const sql = await db.all(`select * from price_plan`);
    return sql;
}

const list = await getPricePlans();
// console.log(list);

// Create a new price plan
export async function addPricePlan(plan_name, sms_price, call_price, id) {
    if (!plan_name || !sms_price || !call_price) {
        throw new Error('All input fields are required');
    }
    const sql = `insert into price_plan (plan_name, sms_price, call_price, id) values (?, ?, ?, ?)`
    await db.run(sql, [plan_name, sms_price, call_price, id]);
}

// await addPricePlan('call 2023', 0.83, 1.50) 

// Update a Price Plan
export async function updatePricePlan(plan_name, sms_price, call_price, id) {
    if (!plan_name ) {
        throw new Error('Please type a valid Price Plan');
    } const checkDB = `SELECT * FROM price_plan WHERE plan_name = ?`;
    const row = await db.all(checkDB, [plan_name]);
    if (row.length === 0) {
        throw new Error(`Price Plan '${plan_name}' not found. Type a valid Price Plan`)
    }
    const sql = `update price_plan set plan_name = ?, sms_price = ?, call_price = ? where id = ?`;
    await db.run(sql, [plan_name, sms_price, call_price, id])
}

//await updatePricePlan('call 2023', 0.55, 2.15, 4)

// Delete a Price Plan

export async function deletePricePlan(plan_name) {
    const sql = `delete from price_plan where plan_name = ?`;
    await db.run(sql, [plan_name])
}

//await deletePricePlan(6);

//PHONE BILL TOTAL
export async function totalPhoneBill(plan_name, actions) {
    const sql = 'SELECT * FROM price_plan WHERE plan_name = ?';
    const row = await db.get(sql, [plan_name]);
    if (!row) {
        throw new Error(`Price plan ${plan_name} not found. Please enter a valid price plan.`);
    }
    let total = 0;
    const usage = actions.split(',');
    for (let i = 0; i < usage.length; i++) {
        const action = usage[i].trim();
        if (!row.hasOwnProperty(action + '_price')) {
            throw new Error(`Invalid usage entry: '${action}'. The price plan '${plan_name}' only takes call and sms.`);
        }
        total += row[action + '_price'];
    }

    // Total Record

    const totalsSQL = `INSERT INTO totals (price_plan_id, total_amount) VALUES (?, ?)`;
    await db.run(totalsSQL, [row.id, total]);

    return 'R' + total.toFixed(2);

}

// STORED TOTALS

export async function billTotals(){
    const sql = `SELECT p.plan_name, 'R' || SUM(t.total_amount) AS total_spent
                FROM totals AS t
                JOIN price_plan AS p ON t.price_plan_id = p.id
                GROUP BY p.plan_name`;

    const getTotals = await db.all(sql);
                if (!getTotals) {
                    throw new Error(`The Price Plan History is Clear`)
                }
                return getTotals;

}

// CLEAR TOTALS TABLE

export async function clearTotalsTable() {
    const sql = `DELETE from totals`;
    const deleteTotals = await db.run(sql);
    return deleteTotals;
}