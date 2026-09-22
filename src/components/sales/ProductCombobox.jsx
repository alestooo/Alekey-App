import {
  ChevronDown,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

/* =========================================================
   PRODUCT COMBOBOX
========================================================= */

export default function ProductCombobox({
  value = "",
  options = [],
  onChange,
  placeholder = "Seleccionar o escribir...",
  disabled = false,
  customValue = "OTROS...",
}) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const containerRef =
    useRef(null);

  const cleanValue =
    String(
      value || ""
    );

  const search =
    cleanValue
      .trim()
      .toLowerCase();

  const filteredOptions =
    options.filter(
      (option) => {
        if (!search) {
          return true;
        }

        return String(
          option
        )
          .toLowerCase()
          .includes(
            search
          );
      }
    );

  const isCustom =
    cleanValue ===
    customValue;

  /* =======================================================
     CLOSE OUTSIDE
  ======================================================= */

  useEffect(() => {
    const handleOutside =
      (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(
            event.target
          )
        ) {
          setOpen(false);
        }
      };

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
    };
  }, []);

  /* =======================================================
     SELECT OPTION
  ======================================================= */

  const selectOption =
    (option) => {
      onChange?.(
        option
      );

      setOpen(false);
    };

  return (
    <div
      ref={
        containerRef
      }
      className="
        sale-combobox
      "
    >
      <div
        className={`
          sale-combobox-control

          ${
            isCustom
              ? "sale-combobox-control-custom"
              : ""
          }

          ${
            disabled
              ? "sale-combobox-disabled"
              : ""
          }
        `}
      >
        <input
          type="text"
          value={
            cleanValue
          }
          disabled={
            disabled
          }
          placeholder={
            placeholder
          }
          autoComplete="off"
          onFocus={() => {
            if (
              !disabled
            ) {
              setOpen(
                true
              );
            }
          }}
          onChange={(
            event
          ) => {
            onChange?.(
              event.target
                .value
            );

            setOpen(
              true
            );
          }}
          className="
            sale-combobox-input
          "
        />

        <button
          type="button"
          disabled={
            disabled
          }
          onClick={() => {
            if (
              disabled
            ) {
              return;
            }

            setOpen(
              (previous) =>
                !previous
            );
          }}
          className="
            sale-combobox-button
          "
          aria-label="Mostrar opciones"
        >
          <ChevronDown
            size={15}
          />
        </button>
      </div>

      {open &&
        !disabled && (
          <div
            className="
              sale-combobox-menu
            "
          >
            {filteredOptions.length >
            0 ? (
              filteredOptions.map(
                (option) => {
                  const optionCustom =
                    option ===
                    customValue;

                  return (
                    <button
                      type="button"
                      key={
                        option
                      }
                      onMouseDown={(
                        event
                      ) => {
                        event.preventDefault();

                        selectOption(
                          option
                        );
                      }}
                      className={`
                        sale-combobox-option

                        ${
                          optionCustom
                            ? "sale-combobox-option-custom"
                            : ""
                        }

                        ${
                          option ===
                          value
                            ? "sale-combobox-option-selected"
                            : ""
                        }
                      `}
                    >
                      {
                        option
                      }
                    </button>
                  );
                }
              )
            ) : (
              <div
                className="
                  sale-combobox-empty
                "
              >
                Puedes escribir
                un valor manual
              </div>
            )}
          </div>
        )}
    </div>
  );
}