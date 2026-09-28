# Divulgación de riesgos

Versión {{termsVersion}}. Borrador preparado a partir del diseño técnico del servicio, para revisión de un abogado.

> **Lo esencial.** Puedes perder parte o todo el SOL que pongas en tu billetera de trading. En la investigación, el
> {{lostPct}} % de las operaciones perdió dinero y {{daysDown}} de {{researchDays}} días terminó en pérdida. Un día, una
> semana o un periodo completo pueden terminar en pérdida. No hay rentabilidad prometida, ni seguro, ni garantía de
> ningún tipo. Usa solo dinero que puedas perder por completo.

## 1. La estrategia es nueva y su historial es corto

- Los resultados que publicamos son de **investigación** del 17 al 27 de septiembre de 2026: {{researchDays}} días
  de datos. Es una muestra pequeña. Por eso mostramos cada promedio con su intervalo del 95 %,
  y aun ese intervalo puede no cubrir lo que pase después.
- La investigación simula la operación real, pero no es operación real. El historial en vivo empezó
  el 28 de septiembre de 2026 con la billetera del fundador y todavía es breve.
- Los mercados cambian. Una regla que funcionó en esos días puede dejar de funcionar sin aviso, por ejemplo si
  cambia el comportamiento del mercado o si otros operadores copian la misma idea.

## 2. Lo que muestran los números de la investigación

- El {{lostPct}} % de las operaciones perdió dinero.
- Cerca del {{bigLossPct}} % de las operaciones perdió más del {{bigLossOverPct}} % de lo que puso. Una sola operación
  puede perder gran parte de lo que puso, y varias pérdidas seguidas pueden dejar un periodo en negativo.
- {{daysDown}} de los {{researchDays}} días terminó en pérdida.
- Son cifras de pocos días de datos: la realidad puede ser peor.
- La liquidez puede ser escasa: vender puede mover el precio en tu contra, y en casos extremos un token puede no
  poder venderse. Un token que no pueda venderse queda en tu billetera de trading y es tuyo.

## 3. Ejecución en la red

- Entre cada decisión y su transacción pasa un tiempo en el que el precio puede moverse: el precio al que se ejecuta
  una operación puede ser peor que el esperado.
- Otros operadores pueden adelantarse a tus órdenes (MEV, "sandwiches").
- Cada operación paga tarifas de la red Solana y del exchange. Con montos pequeños, estas tarifas pesan más.
- Una transacción puede fallar, llegar tarde o no confirmarse. La red Solana puede congestionarse o detenerse.

## 4. Tecnología y terceros

- **Nuestro software puede tener errores.** Lo probamos, pero ningún software está libre de fallas. Un error puede
  causar compras o ventas equivocadas, o que una venta no ocurra a tiempo.
- El servicio depende de terceros que no controlamos: Privy (las billeteras y el inicio de sesión), proveedores de
  acceso a la red y de datos de mercado, el exchange donde opera, nuestro proveedor de servidores y GitHub (este sitio). Si alguno falla o cambia sus condiciones, el servicio puede detenerse o empeorar.
- **El permiso que nos das tiene límites, pero no es perfecto.** La política que Privy hace cumplir solo permite
  comprar y vender tokens en un exchange descentralizado de Solana y enviar SOL a tu Phantom, a la billetera de comisiones de PurpleSky y a pequeñas propinas de
  la red. No permite enviar fondos a ninguna otra dirección. Aun así, si alguien tomara control de nuestro servidor
  o de su llave, podría operar mal tu billetera o enviar SOL a la billetera de comisiones de PurpleSky. La política
  tampoco puede verificar que la comisión esté bien calculada; eso lo hace nuestro software, y cada liquidación
  queda en la cadena para que la revises.

## 5. De tu lado

- Tu Phantom y tu dispositivo son tu responsabilidad. Nunca te pediremos tu frase semilla ni tu llave privada.
  Desconfía de cualquiera que lo haga en nuestro nombre.
- Si exportas la llave de tu billetera de trading, guárdala como guardarías dinero en efectivo.
- Mover fondos fuera de tu billetera de trading durante un periodo lo termina antes. Quitar el permiso de
  PurpleSky durante un periodo impide que el trader venda lo que esté abierto; en ese caso, esas posiciones
  quedan a tu cargo.

## 6. Riesgo legal y regulatorio

- El servicio está en revisión legal en Chile. Solo se abre a otras personas después de esa revisión, y las normas
  pueden cambiar. Podríamos tener que modificarlo, pausarlo o cerrarlo. Si eso pasa durante tu periodo, lo
  terminaremos y liquidaremos como si hubieras elegido terminar antes.
- Las criptomonedas no son moneda de curso legal en Chile, y el servicio no cuenta con garantía estatal ni seguro.
- Tus obligaciones tributarias por las ganancias son tuyas. Consulta a un asesor si tienes dudas.

## 7. Cuánto poner

Solo lo que puedas perder por completo sin que afecte tu vida. El mínimo es {{minSol}} SOL y el máximo {{maxSol}}
SOL por persona. Que el máximo sea bajo es a propósito.

¿Preguntas? Escríbenos a {{email}}.
