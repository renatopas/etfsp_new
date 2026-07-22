<script lang="ts">
  import { page } from "$app/state";
  import { onMount, tick } from "svelte";
  import Button from "./components/Button.svelte";
  import PageContainer from "./components/PageContainer.svelte";

  interface NavigationItem {
    href: string;
    label: string;
    paths: string[];
  }

  const navigationItems: NavigationItem[] = [
    { href: "/", label: "Início", paths: ["/"] },
    {
      href: "/exalunos",
      label: "Ex-alunos",
      paths: ["/exalunos", "/exalunos_lista", "/detalhe_exaluno"],
    },
    {
      href: "/lista_foto",
      label: "Fotos",
      paths: ["/lista_foto", "/cadfoto"],
    },
    { href: "/novocadastro", label: "Cadastre-se", paths: ["/novocadastro"] },
  ];

  let menuOpen = $state(false);
  let menuButton = $state<HTMLButtonElement>();
  let navigationEnhanced = $state(false);
  let pathname = $derived(page.url.pathname);

  onMount(() => {
    navigationEnhanced = true;

    const wideNavigation = window.matchMedia("(min-width: 48rem)");
    const closeMobileMenu = (event: MediaQueryListEvent) => {
      if (!event.matches) {
        menuOpen = false;
      }
    };

    wideNavigation.addEventListener("change", closeMobileMenu);
    return () => wideNavigation.removeEventListener("change", closeMobileMenu);
  });

  function isCurrent(item: NavigationItem): boolean {
    return item.paths.includes(pathname);
  }

  function closeMenu() {
    menuOpen = false;
  }

  async function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && menuOpen) {
      menuOpen = false;
      await tick();
      menuButton?.focus();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<header class="site-header" class:site-header--enhanced={navigationEnhanced}>
  <PageContainer>
    <div class="site-header__content">
      <a
        class="site-header__brand"
        href="/"
        aria-label="Ex-alunos da Escola Técnica Federal de São Paulo"
      >
        <img
          class="site-header__logo"
          src="/images/logoex.gif"
          alt="Ex-alunos da Escola Técnica Federal de São Paulo"
          width="345"
          height="75"
        />
      </a>

      <Button
        className="site-header__menu-button"
        variant="secondary"
        ariaControls="site-navigation"
        ariaExpanded={menuOpen}
        onclick={() => (menuOpen = !menuOpen)}
        bind:element={menuButton}
      >
        Menu
      </Button>

      <nav
        id="site-navigation"
        class:site-navigation--open={menuOpen}
        class="site-navigation"
        aria-label="Navegação principal"
      >
        <ul>
          {#each navigationItems as item}
            <li>
              <a
                href={item.href}
                aria-current={isCurrent(item) ? "page" : undefined}
                onclick={closeMenu}>{item.label}</a
              >
            </li>
          {/each}
        </ul>
      </nav>
    </div>
  </PageContainer>
</header>
