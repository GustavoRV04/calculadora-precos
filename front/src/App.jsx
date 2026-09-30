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

  return (
    <div>

      <h1>
        Calculadora de Preços
      </h1>

      <Header 
        restauranteAtivo={restauranteAtivo} 
        setRestauranteAtivo={setRestauranteAtivo} 
      />

      <hr />

      <ProdutoForm restauranteAtivo={restauranteAtivo}/>

      <hr />

      <ItemForm restauranteAtivo={restauranteAtivo}/>

      <hr />

      <PratoForm restauranteAtivo={restauranteAtivo}/>

      <hr />

      <PratoItemForm restauranteAtivo={restauranteAtivo}/>

      <hr />

      <ResumoPrato restauranteAtivo={restauranteAtivo}/>

    </div>
  );
}

export default App;