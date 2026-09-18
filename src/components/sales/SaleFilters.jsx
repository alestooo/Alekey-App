import { Search } from "lucide-react";

export default function SaleFilters({
  title,
  subtitle,
  count,
  accentColor = "#F79598",

  searchValue = "",
  searchPlaceholder = "Buscar...",
  onSearchChange,

  showSearch = true,

  rightContent,
}) {
  const coloredTitle =
    count !== undefined;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-6 mb-10">
        <div>
          <h2
            className="text-4xl font-black italic uppercase tracking-tighter"
            style={
              coloredTitle
                ? {
                    color:
                      accentColor,
                  }
                : undefined
            }
          >
            {title}

            {count !== undefined && (
              <span
                style={{
                  color:
                    accentColor,
                  opacity: 0.7,
                }}
              >
                {" "}
                ({count})
              </span>
            )}

            {count === undefined && (
              <span
                style={{
                  color:
                    accentColor,
                }}
              >
                .
              </span>
            )}
          </h2>

          {subtitle && (
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1 font-black">
              {subtitle}
            </p>
          )}
        </div>

        {rightContent && (
          <div>
            {rightContent}
          </div>
        )}
      </div>

      {showSearch && (
        <div className="mb-10 relative">
          <Search
            className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
            size={20}
          />

          <input
            type="text"
            placeholder={
              searchPlaceholder
            }
            className="w-full pl-14 pr-8 py-5 bg-white rounded-4xl shadow-xl outline-none font-bold text-slate-600 focus:ring-4 ring-[#F79598]/10"
            value={searchValue}
            onChange={(event) => {
              if (
                onSearchChange
              ) {
                onSearchChange(
                  event.target.value
                );
              }
            }}
          />
        </div>
      )}
    </>
  );
}