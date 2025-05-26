// supabase/functions/send-sms/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Requisição preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { recipient, text } = await req.json()
    const apiKey = "bra2e10206a1355276636ee12b648966e3a799bf7bae146854b40956af2e8ac1466683"

    const mobizonRes = await fetch(`https://api.mobizon.com.br/service/message/sendSmsMessage?output=json&api=v1&apiKey=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient, text })
    })

    const mobizonJson = await mobizonRes.json()

    return new Response(JSON.stringify(mobizonJson), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
})
