export default function Sidebar({ models, activeId, onSelect }) {
  const groups = [...new Set(models.map(m => m.group))]

  return (
    <aside
      className="w-55 min-h-screen bg-(--surface) border-r border-(--border) flex flex-col shrink-0"
    >
      <div className="px-5 pt-7 pb-5 border-b border-(--border)">

        <h1 className="m-0 text-[17px] leading-[1.3] text-(--text)">
          Sentiment
          <br />
          Analysis
        </h1>

        
      </div>

      <nav className="flex-1 py-3">
        {groups.map(group => {
          const groupModels = models.filter(m => m.group === group)
          const groupColor = groupModels[0].color

          return (
            <div key={group} className="mb-1">
              <div
                className="px-5 pt-2 pb-1 text-[10px] font-medium tracking-[0.12em] uppercase font-mono"
                style={{ color: groupColor }}
              >
                {group}
              </div>

              {groupModels.map(model => {
                const isActive = model.id === activeId

                return (
                  <button
                    key={model.id}
                    onClick={() => onSelect(model.id)}
                    className="flex items-center gap-2 w-full px-5 py-2.25 text-left text-[13px] transition-all duration-150 cursor-pointer border-none"
                    style={{
                      background: isActive ? model.colorDim : 'transparent',
                      borderLeft: isActive
                        ? `3px solid ${model.color}`
                        : '3px solid transparent',
                      color: isActive ? model.color : 'var(--muted)',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.color = 'var(--text)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.color = 'var(--muted)'
                      }
                    }}
                  >
                    {model.name}
                  </button>
                )
              })}
            </div>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-(--border) text-[11px] text-(--muted)">
        6 models
      </div>
    </aside>
  )
}