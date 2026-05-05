import React, { useState } from 'react';
import {
  Dimensions,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import Svg, { Path } from 'react-native-svg';

import colors from '../../utils/colors';
import { Breakpoint } from '../types/provider.types';
import Ionicons from '@expo/vector-icons/Ionicons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface TimelineCardProps {
  breakpoint: Breakpoint;
  alignment: 'left' | 'right';
  showConnector?: boolean;
  onEdit?: (bp: Breakpoint) => void;
}

const STATUS_DOT: Record<string, { color: string; filled: boolean }> = {
  concluido: { color: '#22C55E', filled: true },
  em_andamento: { color: colors.primary, filled: true },
  pendente: { color: '#968BE7', filled: false },
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONNECTOR_WIDTH = SCREEN_WIDTH * 0.4;
const CONNECTOR_HEIGHT = 55;

export function TimelineCard({
  breakpoint,
  alignment,
  showConnector = false,
  onEdit,
}: TimelineCardProps) {
  const [expanded, setExpanded] = useState(false);
  const dot = STATUS_DOT[breakpoint.status] ?? STATUS_DOT.pendente;
  const commentCount = breakpoint.comentarios.length;

  function toggleComments() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }

  return (
    <View style={styles.outerWrapper}>
      <View
        style={[
          styles.wrapper,
          alignment === 'right' ? styles.wrapperRight : styles.wrapperLeft,
        ]}>

        <View style={styles.headerRow}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: dot.filled ? dot.color : 'transparent',
                borderColor: dot.color,
              },
            ]}
          />
          <Text style={styles.title} numberOfLines={1}>
            {breakpoint.titulo}
          </Text>
          {onEdit && (
            <TouchableOpacity
              style={styles.editBtn}
              activeOpacity={0.7}
              onPress={() => onEdit?.(breakpoint)}>
              <Icon name="pencil" size={13} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.description} numberOfLines={expanded ? undefined : 3}>
            {breakpoint.descricao}
          </Text>

          <View style={styles.pillsRow}>
            <TouchableOpacity
              style={[
                styles.commentPill,
                expanded && styles.commentPillActive,
              ]}
              activeOpacity={0.7}
              onPress={toggleComments}>
              <Text
                style={[
                  styles.commentLabel,
                  expanded && styles.commentLabelActive,
                ]}>
                Comentario{commentCount > 0 ? ` (${commentCount})` : ''}
              </Text>
              <Icon
                name={expanded ? 'chevron-up' : 'chatbubble-ellipses-outline'}
                size={11}
                color={expanded ? colors.surface : colors.primary}
              />
            </TouchableOpacity>

            <View style={styles.datePill}>
              <Text style={styles.dateLabel}>{breakpoint.data}</Text>
            </View>
          </View>

          {expanded && (
            <View style={styles.commentsSection}>
              {commentCount === 0 ? (
                <Text style={styles.noComments}>Nenhum comentário ainda.</Text>
              ) : (
                breakpoint.comentarios.map((c) => (
                  <View key={c.id} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <View style={styles.commentAvatar}>
                        <Icon name="person" size={10} color={colors.primary} />
                      </View>
                      <Text style={styles.commentAuthor}>{c.autor}</Text>
                      <Text style={styles.commentDate}>{c.data}</Text>
                    </View>
                    <Text style={styles.commentText}>{c.texto}</Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </View>

      {showConnector && (
        <View
          style={[
            styles.connectorContainer,
            alignment === 'left' ? styles.connectorLeft : styles.connectorRight,
          ]}>
          <Svg
            width={CONNECTOR_WIDTH}
            height={CONNECTOR_HEIGHT}
            viewBox={`0 0 ${CONNECTOR_WIDTH} ${CONNECTOR_HEIGHT}`}>
            <Path
              d={
                alignment === 'left'
                  ? `M 0 0 C 0 ${CONNECTOR_HEIGHT / 2}, ${CONNECTOR_WIDTH} ${CONNECTOR_HEIGHT / 2}, ${CONNECTOR_WIDTH} ${CONNECTOR_HEIGHT}`
                  : `M ${CONNECTOR_WIDTH} 0 C ${CONNECTOR_WIDTH} ${CONNECTOR_HEIGHT / 2}, 0 ${CONNECTOR_HEIGHT / 2}, 0 ${CONNECTOR_HEIGHT}`
              }
              stroke="#7C3AED"
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />
          </Svg>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    marginBottom: 55,
  },
  wrapper: {
    width: '60%',

  },
  wrapperLeft: {
    alignSelf: 'flex-start',
    marginLeft: 18,
  },
  wrapperRight: {
    alignSelf: 'flex-end',
    marginRight: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
    backgroundColor: '#F0E6FF',
    borderColor: '#CBC3F8',
    borderWidth: 1,
    padding: 9,
    borderTopEndRadius: 14,
    borderTopStartRadius: 14,
  },
  dot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2.5,
    marginRight: 7,
    marginLeft: 10
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,

  },
  editBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomEndRadius: 14,
    borderBottomStartRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    borderColor: 'rgba(139, 92, 246, 0.10)',
    shadowColor: '#4A1D96',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,

  },
  description: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: 'OpenSans_400Regular',
    color: '#',
    marginBottom: 10,
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  commentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 50,
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  commentPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  commentLabel: {
    fontSize: 10,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.primary,
  },
  commentLabelActive: {
    color: colors.surface,
  },
  datePill: {
    backgroundColor: '#CBC3F8',
    borderRadius: 50,
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  dateLabel: {
    fontSize: 10,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
  },
  commentsSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.08)',
    paddingTop: 10,
    gap: 10,
  },
  noComments: {
    fontSize: 11,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  commentItem: {
    gap: 3,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAuthor: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  commentDate: {
    fontSize: 9,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textMuted,
  },
  commentText: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'OpenSans_400Regular',
    color: '#4B5563',
    paddingLeft: 24,
  },
  connectorContainer: {
    position: 'absolute',
    bottom: -CONNECTOR_HEIGHT,
    height: CONNECTOR_HEIGHT,
    width: CONNECTOR_WIDTH,
    zIndex: -1,
  },
  connectorLeft: {
    left: '30%',
  },
  connectorRight: {
    right: '30%',
  },
});
