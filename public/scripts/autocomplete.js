document.addEventListener("DOMContentLoaded", async function () {
  const pesquisaInput = document.getElementById("pesquisa");
  const resultadoPesquisa = document.getElementById("resultado-pesquisa");
  const headerPesquisa = document.getElementById("header-pesquisa");

  let contatos = [];

  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/usuario/pesquisa", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Erro ao buscar contatos");

    contatos = await res.json();
    console.log("Contatos carregados:", contatos);
  } catch (error) {
    console.error("Erro ao carregar contatos:", error);
  }

  function filtrarContatos(termo) {
    const termoNormalizado = termo.replace(/\D/g, "").toLowerCase();

    return contatos.filter((contato) => {
      const telefoneNormalizado = (contato.telefone || "").replace(/\D/g, "");
      return (
        contato.nome.toLowerCase().includes(termo) ||
        contato.sobrenome.toLowerCase().includes(termo) ||
        telefoneNormalizado.includes(termoNormalizado) ||
        (contato.email && contato.email.toLowerCase().includes(termo))
      );
    });
  }

  function renderizarResultados(resultados) {
    resultadoPesquisa.innerHTML = "";
    if (resultados.length === 0) {
      resultadoPesquisa.style.display = "none";
      return;
    }

    resultados.forEach((contato) => {
      const li = document.createElement("li");
      const a = document.createElement("a");

      a.href = `/contato/${contato._id}`;
      a.classList = "link-pesquisa";
      a.textContent = `${contato.nome} ${contato.sobrenome} - ${contato.email} - ${contato.telefone}`;
      li.appendChild(a);

      li.addEventListener("click", () => {
        pesquisaInput.value = `${contato.nome} ${contato.sobrenome}`;
        resultadoPesquisa.style.display = "none";
        headerPesquisa.style.borderRadius = "20px";
      });

      resultadoPesquisa.appendChild(li);
    });

    resultadoPesquisa.style.display = "block";
    headerPesquisa.style.borderRadius = "20px 20px 0px 0px";
  }

  pesquisaInput.addEventListener("input", function () {
    const termo = pesquisaInput.value.toLowerCase();
    if (termo.length > 0) {
      const resultados = filtrarContatos(termo);
      console.log("Resultados da busca:", resultados);
      renderizarResultados(resultados);
    } else {
      resultadoPesquisa.style.display = "none";
      headerPesquisa.style.borderRadius = "20px";
    }
  });

  document.addEventListener("click", function (event) {
    if (
      !resultadoPesquisa.contains(event.target) &&
      event.target !== pesquisaInput
    ) {
      resultadoPesquisa.style.display = "none";
      headerPesquisa.style.borderRadius = "20px";
    }
  });
});
