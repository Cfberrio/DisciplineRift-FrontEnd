# Script para enviar campaña del Labor Day a todos los suscriptores del newsletter
Write-Host "🎉 === INICIANDO CAMPAÑA LABOR DAY MASIVA ===" -ForegroundColor Green
Write-Host "🕐 Hora de inicio: $(Get-Date)" -ForegroundColor Yellow

# Primero obtener la información de cuántos suscriptores hay
try {
    Write-Host "📋 Obteniendo información de suscriptores..." -ForegroundColor Cyan
    $campaignInfo = Invoke-RestMethod -Uri "http://localhost:3000/api/send-labor-day-campaign" -Method GET
    
    if ($campaignInfo.success) {
        Write-Host "✅ Información obtenida:" -ForegroundColor Green
        Write-Host "   - Total de suscriptores: $($campaignInfo.totalSubscribers)" -ForegroundColor White
        Write-Host "   - Gmail configurado: $($campaignInfo.gmailConfigured)" -ForegroundColor White
        
        if ($campaignInfo.totalSubscribers -eq 0) {
            Write-Host "⚠️ No hay suscriptores en la base de datos" -ForegroundColor Yellow
            exit
        }
        
        # Confirmar envío
        Write-Host ""
        Write-Host "¿Proceder con el envío masivo? (Y para continuar, cualquier otra tecla para cancelar)" -ForegroundColor Yellow
        $confirmation = Read-Host
        
        if ($confirmation -ne "Y" -and $confirmation -ne "y") {
            Write-Host "❌ Campaña cancelada por el usuario" -ForegroundColor Red
            exit
        }
        
    } else {
        Write-Host "❌ Error obteniendo información: $($campaignInfo.message)" -ForegroundColor Red
        exit
    }
    
} catch {
    Write-Host "❌ Error de conexión obteniendo información: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Proceder con el envío masivo
try {
    Write-Host ""
    Write-Host "🚀 Iniciando envío masivo..." -ForegroundColor Green
    
    $massResult = Invoke-RestMethod -Uri "http://localhost:3000/api/send-labor-day-campaign" -Method POST -ContentType "application/json" -Body "{}"
    
    if ($massResult.success) {
        Write-Host "✅ === CAMPAÑA COMPLETADA EXITOSAMENTE ===" -ForegroundColor Green
        Write-Host "📊 Resumen:" -ForegroundColor Cyan
        Write-Host "   - Total de suscriptores: $($massResult.totalSubscribers)" -ForegroundColor White
        Write-Host "   - Correos enviados: $($massResult.emailsSent)" -ForegroundColor Green
        Write-Host "   - Correos fallidos: $($massResult.emailsFailed)" -ForegroundColor Red
        
        if ($massResult.results.sent.Count -gt 0) {
            Write-Host ""
            Write-Host "✅ Primeros correos enviados exitosamente:" -ForegroundColor Green
            $firstFive = $massResult.results.sent | Select-Object -First 5
            for ($i = 0; $i -lt $firstFive.Count; $i++) {
                Write-Host "   $($i + 1). $($firstFive[$i])" -ForegroundColor White
            }
            if ($massResult.results.sent.Count -gt 5) {
                Write-Host "   ... y $($massResult.results.sent.Count - 5) más" -ForegroundColor White
            }
        }
        
        if ($massResult.results.failed.Count -gt 0) {
            Write-Host ""
            Write-Host "❌ Correos fallidos:" -ForegroundColor Red
            foreach ($failed in $massResult.results.failed) {
                Write-Host "   - $($failed.email): $($failed.error)" -ForegroundColor White
            }
        }
        
    } else {
        Write-Host "❌ === CAMPAÑA FALLIDA ===" -ForegroundColor Red
        Write-Host "Error: $($massResult.message)" -ForegroundColor White
        if ($massResult.error) {
            Write-Host "Detalles: $($massResult.error)" -ForegroundColor White
        }
    }
    
} catch {
    Write-Host "❌ === ERROR CRÍTICO EN LA CAMPAÑA MASIVA ===" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor White
}

Write-Host ""
Write-Host "🕐 Hora de finalización: $(Get-Date)" -ForegroundColor Yellow
Write-Host "🎉 === FIN DEL SCRIPT ===" -ForegroundColor Green











