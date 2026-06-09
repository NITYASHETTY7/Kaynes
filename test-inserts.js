import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInserts() {
  console.log("Testing image insert...");
  const imgData = {
    id: '00000000-0000-0000-0000-000000000401',
    device_id: 42,
    url: 'https://picsum.photos/seed/4201/600/400',
    label: 'PCB solder-joint inspection',
    size_mb: 4.2,
    tags: ['pcb', 'solder', 'defect-review'],
    status: 'processed'
  };
  
  const { error: imgErr } = await supabase.from('images').insert([imgData]);
  console.log("Image insert error:", imgErr);

  console.log("Testing ai_results insert...");
  const aiData = {
    id: '00000000-0000-0000-0000-000000000601',
    image_id: '00000000-0000-0000-0000-000000000401',
    defect_detected: true,
    classification: 'PCB Solder Defect',
    confidence: 94.5,
    severity: 'critical'
  };
  const { error: aiErr } = await supabase.from('ai_results').insert([aiData]);
  console.log("AI result insert error:", aiErr);
}

testInserts().catch(console.error);
