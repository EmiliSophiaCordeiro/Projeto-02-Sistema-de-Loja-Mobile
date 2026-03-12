import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Image, Alert, ScrollView, StyleSheet, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cores = {
  azul: "#3b82f6",
  roxo: "#8b5cf6",
  rosa: "#ec4899",
};

const Fundo = ({ children }) => (
  <ImageBackground
    source={{ uri: 'https://i.pinimg.com/1200x/59/6b/43/596b435444119590ee6bcc796488d42b.jpg' }} // troque pelo link da sua imagem
    style={styles.fundo}
  >
    <ScrollView contentContainerStyle={styles.scroll}>
      {children}
    </ScrollView>
  </ImageBackground>
);

export default function App() {
  const [tela, setTela] = useState("login");
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // ---------------- LOGIN ----------------
  const Login = () => {
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');

    const login = async () => {
      if (usuario === 'admin' && senha === '1234') {
        setTela("admin");
        return;
      }
      const clientes = JSON.parse(await AsyncStorage.getItem('clientes')) || [];
      const cliente = clientes.find(c => c.usuario === usuario && c.senha === senha);
      if (cliente) {
        setUsuarioLogado(cliente.usuario);
        setTela("produtos");
      } else {
        Alert.alert("Erro", "Usuário ou senha inválidos");
      }
    };

    return (
      <Fundo>
        <View style={styles.container}>
          <Text style={styles.titulo}>Login</Text>
          <TextInput placeholder="Usuário" value={usuario} onChangeText={setUsuario} style={styles.input} />
          <TextInput placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry style={styles.input} />
          <View style={styles.botao}><Button title="Entrar" color={cores.azul} onPress={login} /></View>
          <View style={styles.botao}><Button title="Cadastrar" color={cores.rosa} onPress={() => setTela("cadastro")} /></View>
        </View>
      </Fundo>
    );
  };

  // ---------------- CADASTRO ----------------
  const Cadastro = () => {
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');

    const cadastrar = async () => {
      const clientes = JSON.parse(await AsyncStorage.getItem('clientes')) || [];
      clientes.push({ usuario, senha });
      await AsyncStorage.setItem('clientes', JSON.stringify(clientes));
      Alert.alert("Sucesso", "Cadastro realizado!");
      setTela("login");
    };

    return (
      <Fundo>
        <View style={styles.container}>
          <Text style={styles.titulo}>Cadastro</Text>
          <TextInput placeholder="Usuário" value={usuario} onChangeText={setUsuario} style={styles.input} />
          <TextInput placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry style={styles.input} />
          <View style={styles.botao}><Button title="Cadastrar" color={cores.roxo} onPress={cadastrar} /></View>
        </View>
      </Fundo>
    );
  };

  // ---------------- ADMIN ----------------
  const Admin = () => {
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [preco, setPreco] = useState('');
    const [imagem, setImagem] = useState('');
    const [estoque, setEstoque] = useState('');
    const [produtos, setProdutos] = useState([]);

    useEffect(() => { carregarProdutos(); }, []);

    const carregarProdutos = async () => {
      const lista = JSON.parse(await AsyncStorage.getItem('produtos')) || [];
      setProdutos(lista);
    };

    const adicionarProduto = async () => {
      const lista = [...produtos, { nome, descricao, preco, imagem, estoque: parseInt(estoque) }];
      await AsyncStorage.setItem('produtos', JSON.stringify(lista));
      setProdutos(lista);
      setNome(''); setDescricao(''); setPreco(''); setImagem(''); setEstoque('');
    };

    return (
      <Fundo>
        <View style={styles.container}>
          <Text style={styles.titulo}>Admin - Produtos</Text>
          <TextInput placeholder="Nome" value={nome} onChangeText={setNome} style={styles.input} />
          <TextInput placeholder="Descrição" value={descricao} onChangeText={setDescricao} style={styles.input} />
          <TextInput placeholder="Preço" value={preco} onChangeText={setPreco} style={styles.input} />
          <TextInput placeholder="Imagem (link)" value={imagem} onChangeText={setImagem} style={styles.input} />
          <TextInput placeholder="Estoque" value={estoque} onChangeText={setEstoque} keyboardType="numeric" style={styles.input} />
          <View style={styles.botao}><Button title="Adicionar Produto" color={cores.azul} onPress={adicionarProduto} /></View>

          <FlatList
            data={produtos}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Text>{item.nome} - R${item.preco} (Estoque: {item.estoque})</Text>
            )}
          />

          <View style={styles.botao}><Button title="Logout" color={cores.rosa} onPress={() => setTela("login")} /></View>
        </View>
      </Fundo>
    );
  };

  // ---------------- PRODUTOS ----------------
  const Produtos = () => {
    const [produtos, setProdutos] = useState([]);
    const [quantidade, setQuantidade] = useState('1');

    useEffect(() => { carregarProdutos(); }, []);

    const carregarProdutos = async () => {
      const lista = JSON.parse(await AsyncStorage.getItem('produtos')) || [];
      setProdutos(lista);
    };

    const adicionarCarrinho = async (produto) => {
      if (parseInt(quantidade) > produto.estoque) {
        alert("Quantidade maior que estoque disponível!");
        return;
      }
      const carrinho = JSON.parse(await AsyncStorage.getItem(`carrinho_${usuarioLogado}`)) || [];
      carrinho.push({ ...produto, quantidade: parseInt(quantidade) });
      await AsyncStorage.setItem(`carrinho_${usuarioLogado}`, JSON.stringify(carrinho));

      const lista = produtos.map(p => p.nome === produto.nome ? { ...p, estoque: p.estoque - parseInt(quantidade) } : p);
      await AsyncStorage.setItem('produtos', JSON.stringify(lista));
      setProdutos(lista);

      alert("Produto adicionado ao carrinho!");
    };

    const compraDireta = async (produto) => {
      if (parseInt(quantidade) > produto.estoque) {
        alert("Quantidade maior que estoque disponível!");
        return;
      }
      const lista = produtos.map(p => p.nome === produto.nome ? { ...p, estoque: p.estoque - parseInt(quantidade) } : p);
      await AsyncStorage.setItem('produtos', JSON.stringify(lista));
      setProdutos(lista);
      alert("Compra realizada diretamente!");
    };

    return (
      <Fundo>
        <View style={styles.container}>
          <Text style={styles.titulo}>Produtos</Text>
          <FlatList
            data={produtos}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{ marginVertical: 10 }}>
                {item.imagem ? <Image source={{ uri: item.imagem }} style={{ width: 100, height: 100 }} /> : null}
                <Text>{item.nome} - R${item.preco}</Text>
                <Text>{item.descricao}</Text>
                <Text>Estoque: {item.estoque}</Text>
                <TextInput placeholder="Quantidade" value={quantidade} onChangeText={setQuantidade} keyboardType="numeric" style={styles.input} />
                <View style={styles.botao}><Button title="Adicionar ao Carrinho" color={cores.azul} onPress={() => adicionarCarrinho(item)} /></View>
                <View style={styles.botao}><Button title="Comprar Agora" color={cores.roxo} onPress={() => compraDireta(item)} /></View>
              </View>
            )}
          />
          <View style={styles.botao}><Button title="Ver Carrinho" color={cores.rosa} onPress={() => setTela("carrinho")} /></View>
          <View style={styles.botao}><Button title="Logout" color={cores.rosa} onPress={() => setTela("login")} /></View>
        </View>
      </Fundo>
    );
  };

    // ---------------- CARRINHO ----------------
  const Carrinho = () => {
    const [carrinho, setCarrinho] = useState([]);

    useEffect(() => { carregarCarrinho(); }, []);

    const carregarCarrinho = async () => {
      const lista = JSON.parse(await AsyncStorage.getItem(`carrinho_${usuarioLogado}`)) || [];
      setCarrinho(lista);
    };

    const finalizarCompra = async () => {
      await AsyncStorage.removeItem(`carrinho_${usuarioLogado}`);
      setCarrinho([]);
      alert("Compra finalizada!");
    };

    return (
      <Fundo>
        <View style={styles.container}>
          <Text style={styles.titulo}>Carrinho</Text>
          <FlatList
            data={carrinho}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Text>{item.nome} - R${item.preco} x {item.quantidade}</Text>
            )}
          />
          <View style={styles.botao}><Button title="Finalizar Compra" color={cores.azul} onPress={finalizarCompra} /></View>
          <View style={styles.botao}><Button title="Voltar" color={cores.roxo} onPress={() => setTela("produtos")} /></View>
        </View>
      </Fundo>
    );
  };

  // ---------------- TROCA DE TELAS ----------------
  if (tela === "login") return <Login />;
  if (tela === "cadastro") return <Cadastro />;
  if (tela === "admin") return <Admin />;
  if (tela === "produtos") return <Produtos />;
  if (tela === "carrinho") return <Carrinho />;
}

// ---------------- ESTILOS ----------------
const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    resizeMode: 'cover',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 20,
    borderRadius: 12,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: cores.roxo,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: cores.azul,
    marginVertical: 8,
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  botao: {
    marginVertical: 6,
  },
});