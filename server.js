import express, { request, response } from 'express'
import pool from './db.js'

const app = express();

app.use(express.json());

app.get('/clientes', async (request, response) => {
    try{
        const lista = await pool.query('SELECT * FROM clientes')
        return response.status(200).json(lista.rows)
    }
    catch(error){
        return response.status(400).json({ERROR: error})
    }
});

app.get('/clientes/:id/pedidos', async (request, response) => {
    try{
        const {id} = request.params
        const lista = await pool.query('select pedidos.produto from pedidos inner join clientes on pedidos.cliente_id = clientes.id where clientes.id = $1 group by pedidos.produto;',[id])
        return response.status(200).json(lista.rows)
    }
    catch(error){
        return response.status(400).json({ERROR: 'e '+error})
    }
})

app.post('/clientes', async (request, response) => {
    try{
        const {nome, email} = request.body
        
        if(!nome && !email){
            return response.status(400).json({ERROR: "ta falntando NOME e EMAIL :("})
        }
        if(!nome){
            return response.status(400).json({ERROR: "ta falando o NOME do cliente"})
        }
        if(!email){
            return response.status(400).json({ERROR: "ta faltando o EMAIL do cliente"})
        }
        
        const resultado = await pool.query('INSERT INTO clientes(nome, email) VALUES($1 ,$2) RETURNING *',  [nome, email])

        return response.status(200).json(resultado.rows[0])
    }
    catch(error){
        return response.status(400).json({ERROR: error})
    }
});

app.put('/clientes/:id', async (request, response) =>{
    try{
    const {id} = request.params
    const {nome, email} = request.body

    const resultado = await pool.query('UPDATE clientes SET nome = COALESCE($1, nome), email = COALESCE($2, email) WHERE id = $3 RETURNING *', [nome, email, id])

    return response.status(200).json(resultado.rows[0])
    }
    catch(error){
        return response.status(400).json({ERROR: error})
    }
})

app.delete('/clientes/:id', async (request, response) =>{
    try{
        const {id} = request.params
        const resultado = await pool.query('DELETE FROM clientes WHERE id = $1', [id])
        return response.status(200).json({Sucesso: `id ${id} deletado`})
    }
    catch(error){
        return response.status(400).json({ERROR: error})
    }
})

app.get('/pedidos', async (request, response) => {
    try{
        const {status} = request.query
        console.log(status)
        if(status){
            const lista = await pool.query('SELECT * FROM pedidos WHERE status = $1', [status])
            if(lista.rows.length == 0){ return response.status(200).json({ERROR: `nenhum status '${status}' encontrado`}) }

            return response.status(200).json(lista.rows[0])
        }

        const lista = await pool.query('SELECT * FROM pedidos')
        return response.status(200).json(lista.rows)
    }
    catch(error){
        return response.status(400).json({ERROR: "a"+error})
    }
});

app.post('/pedidos/:id', async (request, response) => {
    try{
        const {produto, valor, status} = request.body
        const {id} = request.params

        const checkID = await pool.query('SELECT id FROM clientes WHERE id = $1', [id])
        if(checkID.rows.length == 0){
            return response.status(400).json({ERROR: "deu ruim no id"})
        }
        
        if(status != 'pendente' || status != 'preparando' || status != 'entregue'){
            return response.status(400).json({ERROR: "status deve ser PENDENTE, PREPARANDO ou ENTREGUE"})
        }

        if(!produto || !valor || !status){
            return response.status(400).json({ERROR: "faltou informações"})
        }

        const resultado = await pool.query('INSERT INTO pedidos(produto, valor, status, cliente_id) VALUES ($1, $2, $3, $4) RETURNING *', [produto, valor, status, id])
        return response.status(200).json(resultado.rows)
    }
    catch(error){
        return response.status(400).json({ERROR: error})
    }
});

app.listen(3333, () => console.log("Servidor rodando na porta 3333"));