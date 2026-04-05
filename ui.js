async function fetchProducts(){const {data,error}=await window.supabaseClient.from("products").select("*").order("created_at",{ascending:false});if(error){console.error(error);return [];}return data||[];}
async function fetchProductById(id){const {data,error}=await window.supabaseClient.from("products").select("*").eq("id",id).single();if(error){console.error(error);return null;}return data;}
async function createOrder(payload){const {data,error}=await window.supabaseClient.from("orders").insert([payload]).select().single();if(error){console.error(error);throw error;}return data;}
