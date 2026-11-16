import ServiceSettingsEditor from './ServiceSettingsEditor'
export default function OpenAiSettings() {
  return (
    <ServiceSettingsEditor
      kind="openai"
      title="OpenAI"
      description="Configura el servicio oficial o un gateway corporativo compatible con Responses API. Al cambiar la URL, introduce un token nuevo. La configuración de esta pantalla reemplaza la del servidor."
      fields={[
        { key: 'endpoint', label: 'URL de OpenAI', type: 'url' },
        { key: 'model', label: 'Modelo' },
      ]}
    />
  )
}
