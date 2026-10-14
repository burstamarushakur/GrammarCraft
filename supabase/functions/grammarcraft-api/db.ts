export function storage(client:any){
 async function checked(query:any){const {data,error}=await query;if(error)throw new Error('School storage unavailable.');return data;}
 function prepare(sql:string){let p:any[]=[];
  async function execute(){switch(sql){
   case 'INSERT INTO game_progress (student_id) VALUES (?1) ON CONFLICT(student_id) DO NOTHING':await checked(client.from('grammarcraft_progress').upsert({student_id:p[0]},{onConflict:'student_id',ignoreDuplicates:true}));return{meta:{changes:1}};
   case 'SELECT * FROM game_progress WHERE student_id = ?1':return checked(client.from('grammarcraft_progress').select('student_id,reset_version,revision,progress_json,updated_at,reset_at').eq('student_id',p[0]).maybeSingle());
   case 'SELECT revision FROM game_progress LIMIT 1':return (await checked(client.from('grammarcraft_progress').select('revision').limit(1)))[0]||null;
   case 'SELECT * FROM game_progress WHERE student_id IN CLASS':return{results:await checked(client.from('grammarcraft_progress').select('student_id,reset_version,revision,progress_json,updated_at,reset_at').in('student_id',p))};
   case 'UPDATE game_progress SET progress_json = ?1, revision = revision + 1, updated_at = ?2 WHERE student_id = ?3 AND revision = ?4 AND reset_version = ?5':return{meta:{changes:(await checked(client.from('grammarcraft_progress').update({progress_json:p[0],revision:p[3]+1,updated_at:p[1]}).eq('student_id',p[2]).eq('revision',p[3]).eq('reset_version',p[4]).select('student_id'))).length}};
   case 'UPDATE game_progress SET progress_json = ?1, reset_version = reset_version + 1, revision = revision + 1, updated_at = NULL, reset_at = ?2 WHERE student_id = ?3 AND reset_version = ?4':{
    const row=await checked(client.from('grammarcraft_progress').select('revision').eq('student_id',p[2]).maybeSingle());if(!row)return{meta:{changes:0}};
    return{meta:{changes:(await checked(client.from('grammarcraft_progress').update({progress_json:p[0],reset_version:p[3]+1,revision:row.revision+1,updated_at:null,reset_at:p[1]}).eq('student_id',p[2]).eq('reset_version',p[3]).eq('revision',row.revision).select('student_id'))).length}};
   }
   case 'DELETE FROM game_sessions WHERE student_id = ?1 AND expires_at < ?2':await checked(client.from('grammarcraft_student_sessions').delete().eq('student_id',p[0]).lt('expires_at',p[1]));return{meta:{changes:0}};
   case 'INSERT INTO game_sessions (token_hash, student_id, reset_version, expires_at) VALUES (?1, ?2, ?3, ?4)':await checked(client.from('grammarcraft_student_sessions').insert({token_hash:p[0],student_id:p[1],reset_version:p[2],expires_at:p[3]}));return{meta:{changes:1}};
   case 'SELECT student_id, reset_version, expires_at FROM game_sessions WHERE token_hash = ?1':return checked(client.from('grammarcraft_student_sessions').select('student_id,reset_version,expires_at').eq('token_hash',p[0]).maybeSingle());
   default:throw new Error('Unsupported storage query.');
  }}
  return{bind(...values:any[]){p=values;return this;},first:execute,all:execute,run:execute};
 }
 return{prepare};
}
