import AlphabeticSortButton from '../components/AlphabeticSortButton'
import { useAlphabeticOrder } from '../hooks/useAlphabeticOrder'
import KnowledgeContributions from '../components/KnowledgeContributions'
import Dropdown from '../components/Dropdown'
import OrganizationKnowledge from '../components/OrganizationKnowledge'
import TaskDocuments from '../components/TaskDocuments'
import { useTranslation } from '../hooks/useTranslation'
import { useLiveUpdates } from '../hooks/useLiveUpdates'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { RefreshCw, Search } from 'lucide-react'
import { useProjectScope } from '../hooks/useProjectScope'
import DataMessage from '../components/DataMessage'
import IconButton from '../components/IconButton'
import KnowledgeDocumentCatalog from '../components/KnowledgeDocumentCatalog'
import KnowledgeArticle from '../components/KnowledgeArticle'
import KnowledgeCodeReviews from '../components/KnowledgeCodeReviews'
import type { WorkspacePageProps } from '../types/WorkspacePageProps'
import type { KnowledgeDocumentKind } from '../types/KnowledgeDocumentKind'
export default function KnowledgePage({ section }: WorkspacePageProps) {
  const { t } = useTranslation()
  const order = useAlphabeticOrder()
  const scope = useProjectScope(true),
    [params, setParams] = useSearchParams(),
    [search, setSearch] = useState(''),
    [refresh, setRefresh] = useState(0)
  const live = useLiveUpdates(scope.projectId==='organization'?null:scope.projectId || undefined)
  const article = params.get('article'),
    contribution=params.get('contribution'),
    codeReviews = section.path === '/code/knowledge'
  const globalOnly=section.path==='/knowledge/security'||(section.path==='/knowledge/best-practices'&&!article)
  const kinds: KnowledgeDocumentKind[] =
    section.path==='/knowledge/security'?['security']:
    section.path === '/knowledge/requirements'
      ? ['requirement']
      : section.path === '/knowledge/rules'
        ? ['business_rule']
        : section.path === '/knowledge/decisions'
          ? ['decision']
          : section.path === '/knowledge/best-practices'
            ? ['best_practice']
            : section.path === '/knowledge/technical-debt'
              ? ['technical_debt']
        : ['document']
  const titles = {
    document: t('Documentos'),
    requirement: t('Requerimientos'),
    business_rule: t('Reglas de negocio'),
    decision: t('Decisiones técnicas'),
    best_practice: t('Buenas prácticas'),
    technical_debt: t('Deuda técnica'),
    security:t('Seguridad'),
  }
  return (
    <section
      aria-label={t(section.label)}
      className="flex min-w-0 flex-1 flex-col"
    >
      {!article && !contribution && <div className="mb-7 flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <Dropdown disabled={globalOnly} label={t('Ámbito del conocimiento')} value={globalOnly?'organization':scope.projectId} options={[...(codeReviews?[]:[{value:'organization',label:t('General de la organización')}]),...scope.choices.map(p=>({value:p.id,label:p.name}))]} onChange={value=>{setParams(new URLSearchParams({project:value}));setSearch('')}}/>
          {scope.projects.hasMore&&<button type="button" className="mt-2 text-xs hover:underline" onClick={()=>void scope.projects.loadMore()}>{t('Más proyectos')}</button>}
        </div>
        {!article && (
          <label className="input input-sm w-full sm:w-56">
            <Search size={15} aria-hidden="true" />
            <input
              aria-label={t('Buscar artículos en esta página')}
              placeholder={t('Buscar en esta página…')}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        )}
        {!article && live !== 'connected' && (
          <IconButton
            type="button"
            label={t('Actualizar conocimiento')}
            disabled={scope.loading}
            onClick={() => {
              setRefresh((value) => value + 1)
              scope.reload()
            }}
          >
            <RefreshCw size={16} />
          </IconButton>
        )}
      </div>}
      {!codeReviews&&scope.projectId&&['document','technical_debt'].includes(kinds[0])&&<KnowledgeContributions key={`${scope.projectId}:${kinds[0]}:${search}`} projectId={scope.projectId==='organization'?null:scope.projectId} kind={kinds[0] as 'document'|'technical_debt'} search={search}/>}
      {contribution ? null : (globalOnly||scope.projectId==='organization')&&!codeReviews ? <><OrganizationKnowledge key={`${section.path}:${search}:${refresh}`} kind={kinds[0]} title={t(section.label)} search={search}/>{kinds[0]==='document'&&!article&&<TaskDocuments key={`organization:${search}`} search={search}/>}</> : scope.loading || scope.error ? (
        <DataMessage
          loading={scope.loading}
          error={t(scope.error)}
          onRetry={scope.reload}
        />
      ) : !scope.projectId ? (
        <DataMessage
          message={t('Selecciona un proyecto para consultar su conocimiento.')}
        />
      ) : codeReviews ? (
        <KnowledgeCodeReviews
          key={`${scope.projectId}:${refresh}`}
          projectId={scope.projectId}
          search={search}
          live={live === 'connected'}
        />
      ) : article ? (
        <KnowledgeArticle
          key={`${scope.projectId}:${article}:${refresh}`}
          projectId={scope.projectId}
          documentId={article}
          live={live === 'connected'}
          projectName={
            scope.choices.find((item) => item.id === scope.projectId)?.name ??
            scope.projectId
          }
        />
      ) : (
        <>
          <header className="mb-7">
            <div className="flex items-center justify-between gap-3"><h1 className="font-serif text-3xl">{t(section.label)}</h1><AlphabeticSortButton descending={order.descending} onChange={order.setDescending}/></div>
            <p className="mt-3 text-sm leading-relaxed text-base-content/55">
              {section.path === '/knowledge/requirements'
                ? t(
                    'Consulta los problemas, objetivos y criterios de aceptación del proyecto.',
                  )
                : section.path === '/knowledge/rules'
                  ? t(
                      'Consulta las reglas del negocio y sus condiciones.',
                    )
                  : section.path === '/knowledge/decisions' ? t('Consulta las decisiones técnicas y sus alternativas.') : section.path === '/knowledge/best-practices' ? t('Consulta las prácticas acordadas por el equipo.') : section.path === '/knowledge/technical-debt' ? t('Consulta la deuda técnica, su impacto y su resolución.') : t('Explora la documentación compartida del proyecto.')}
            </p>
          </header>
          <div className="flex flex-col gap-9">
            {kinds[0]==='document'&&<TaskDocuments key={`${scope.projectId}:${search}`} projectId={scope.projectId} search={search}/>}
            {kinds.map((kind) => (
              <KnowledgeDocumentCatalog
                key={`${scope.projectId}:${kind}:${refresh}:${order.descending}`}
                projectId={scope.projectId}
                kind={kind}
                search={search}
                title={titles[kind]}
                showHeading={kinds.length > 1}
                descending={order.descending}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
