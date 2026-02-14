import supabaseAdmin from './lib/supabaseAdmin.js';

async function checkInterviewSchema() {
    const { data, error } = await supabaseAdmin.from('interviews').select('*').limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (data && data.length > 0) {
        // Print each key on a new line to avoid truncation
        if (data[0]) {
            console.log('--- Columns ---');
            Object.keys(data[0]).forEach(key => console.log(key));
        }
    } else {
        console.log('No interviews found');
    }
}

checkInterviewSchema();
