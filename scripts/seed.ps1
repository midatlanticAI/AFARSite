$headers = @{ 'Content-Type' = 'application/json' }
$api = 'http://127.0.0.1:8000/api/v1/voice/create_job_from_voice'
$payloads = @(
  @{ idempotency_key = 'seed-001' ; call_id = 'seed-call-001' ; language = 'en' ; appliance = @{ type = 'washer' ; symptom = 'not spinning' } ; customer = @{ name = 'Alice Johnson' ; phone = '5551110001' ; email = 'alice@example.com' ; address = @{ address1='123 Main St' ; city='Fredericksburg' ; state='VA' ; zip_code='22401' } } },
  @{ idempotency_key = 'seed-002' ; call_id = 'seed-call-002' ; language = 'en' ; appliance = @{ type = 'refrigerator' ; symptom = 'not cooling' } ; customer = @{ name = 'Bob Smith' ; phone = '5551110002' ; email = 'bob@example.com' ; address = @{ address1='456 Oak Ave' ; city='Stafford' ; state='VA' ; zip_code='22554' } } },
  @{ idempotency_key = 'seed-003' ; call_id = 'seed-call-003' ; language = 'en' ; appliance = @{ type = 'dishwasher' ; symptom = 'leaking' } ; customer = @{ name = 'Carol Davis' ; phone = '5551110003' ; email = 'carol@example.com' ; address = @{ address1='789 Pine Rd' ; city='Spotsylvania' ; state='VA' ; zip_code='22553' } } }
)

foreach ($p in $payloads) {
  $json = ($p | ConvertTo-Json -Depth 8)
  try { Invoke-RestMethod -Method POST -Uri $api -Headers $headers -Body $json | Out-Null } catch { Write-Warning "Seed error: $_" }
}

Write-Host "Seed complete."


