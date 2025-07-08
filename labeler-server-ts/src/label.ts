import { ComAtprotoLabelDefs } from '@atcute/client/lexicons';
import { LabelerServer } from '@skyware/labeler';

import { DID, SIGNING_KEY } from './config.js';
import { LABELS, LABEL_LIMIT } from './constants.js';
import logger from './logger.js';

export const labelerServer = new LabelerServer({ did: DID, signingKey: SIGNING_KEY });

export const label = (did: string, newLabel: string, neg: boolean = false) => {
  // make sure newLabel is a valid identifier
  if (!LABELS.some(label => label.identifier === newLabel)) {
    throw new Error(`${newLabel} is not a valid label identifier`);
  }

  if (neg) {
    logger.info(`Label to delete: ${newLabel}`);
    labelerServer.createLabel({ uri: did, val: newLabel, neg: true });
    logger.info(`Successfully deleted label ${label}`);
  } else {
    const labels = fetchCurrentLabels(did);
    logger.info(`To add label: ${newLabel}`);

    if (labels.size >= LABEL_LIMIT) {
      labelerServer.createLabels({ uri: did }, { negate: Array.from(labels) });
      logger.info(`Over limit. Successfully negated existing labels: ${Array.from(labels).join(', ')}`);
    }

    labelerServer.createLabel({ uri: did, val: newLabel });
    logger.info(`Successfully labeled ${did} with ${newLabel}`);
  }
};

export const removeAll = (did: string) => {
  const labels = fetchCurrentLabels(did);
  const labelsToDelete: string[] = Array.from(labels);

  if (labelsToDelete.length === 0) {
    logger.info(`No labels to delete`);
  } else {
    logger.info(`Labels to delete: ${labelsToDelete.join(', ')}`);
    labelerServer.createLabels({ uri: did }, { negate: labelsToDelete });
    logger.info('Successfully deleted all labels');
  }
};

function fetchCurrentLabels(did: string) {
  const query = labelerServer.db
    .prepare<string[]>(`SELECT * FROM labels WHERE uri = ?`)
    .all(did) as ComAtprotoLabelDefs.Label[];

  const labels = query.reduce((set, label) => {
    if (!label.neg) set.add(label.val);
    else set.delete(label.val);
    return set;
  }, new Set<string>());

  if (labels.size > 0) {
    logger.info(`Current labels: ${Array.from(labels).join(', ')}`);
  }

  return labels;
}