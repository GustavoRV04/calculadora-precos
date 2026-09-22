import ProdutoForm
from "./components/ProdutoForm";

import ItemForm
from "./components/ItemForm";

import PratoForm
from "./components/PratoForm";

import PratoItemForm
from "./components/PratoItemForm";


function App() {

  return (
    <div>

      <h1>
        Calculadora de Preços
      </h1>

      <ProdutoForm />

        <hr />

        <ItemForm />

        <hr />

        <PratoForm />

        <hr />

        <PratoItemForm />

    </div>
  );
}

export default App;