// import type {RequestHandler} from 'express'
// import {generateScript} from 'template/src/Template'
// import {saveTemplateVersion} from './Database.js'
// import {initiateLogin, resolveLogin} from '../../backend/src/Login.js'
// import {resolveTemplateRuntimeVersion} from './Template.js'
//
// export const generateScriptRouteFn: RequestHandler = async (req, res) => {
//     const script = generateScript(req.body)
//     await saveTemplateVersion(req.user!.userId, req.body.repository, TEMPLATE_VERSION)
//     res.set('Content-Type', 'text/plain')
//     res.set('Content-Disposition', 'inline; filename="draft.sh"')
//     res.send(script)
// }
