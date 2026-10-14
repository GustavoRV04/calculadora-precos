import { useState } from "react";

import Header
from "./components/Header";

import ProdutoForm
from "./components/ProdutoForm";

import ItemForm
from "./components/ItemForm";

import PratoForm
from "./components/PratoForm";

import PratoItemForm
from "./components/PratoItemForm";

import ResumoPrato
from "./components/ResumoPrato";


function App() {

  const [restauranteAtivo, setRestauranteAtivo] = useState("");
  const [dataVersion, setDataVersion] = useState(0);
  const atualizarDados = () => setDataVersion((version) => version + 1);

  return (
    <div>

      <h1>
        Lucro Certo
      </h1>

      <Header 
        restauranteAtivo={restauranteAtivo} 
        setRestauranteAtivo={setRestauranteAtivo} 
      />

      <hr />

      <ProdutoForm restauranteAtivo={restauranteAtivo} onSaved={atualizarDados}/>

      <hr />

      <ItemForm restauranteAtivo={restauranteAtivo} dataVersion={dataVersion} onSaved={atualizarDados}/>

      <hr />

      <PratoForm restauranteAtivo={restauranteAtivo} onSaved={atualizarDados}/>

      <hr />

      <PratoItemForm restauranteAtivo={restauranteAtivo} dataVersion={dataVersion} onSaved={atualizarDados}/>

      <hr />

      <ResumoPrato restauranteAtivo={restauranteAtivo} dataVersion={dataVersion}/>

    </div>
  );
}

export default App;