import styled from '@emotion/styled';
import { Colors } from '@blueprintjs/core';

export interface AbsoluteProps {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

function isNumber(x: any): x is number {
  return typeof x === 'number';
}

type ColumnProps = { spacing?: number; padding?: number | string };
export const Column = styled.div<ColumnProps>(
  ({ spacing = 0, padding = 0 }: ColumnProps) => `
  display: flex;
  flex-direction: column;
  padding: ${isNumber(padding) ? `${padding}px` : padding};
  & > * + * { margin-top: ${spacing}px; }
`
);

type RowProps = { spacing?: number };
export const Row = styled.div<RowProps>(
  ({ spacing = 0 }: RowProps) => `
  display: flex;
  flex-direction: row;
  align-items: center;
  & > * + * { margin-left: ${spacing}px; }
`
);

export const Absolute = styled.div<AbsoluteProps>(
  ({ top, left, right, bottom }: AbsoluteProps) => `
  position: absolute;
  ${top != null ? `top: ${top}px;` : ''}
  ${left != null ? `left: ${left}px;` : ''}
  ${right != null ? `right: ${right}px;` : ''}
  ${bottom != null ? `bottom: ${bottom}px;` : ''}
`
);

export type BoxProps = { darkMode?: boolean };
export const getBoxStyle = (props: BoxProps) => `
  background: ${props.darkMode ? Colors.DARK_GRAY5 : `rgba(255, 255, 255, 0.9)`};
  border-radius: 4px;
  font-size: 11px;
  box-shadow: 0 0 5px #aaa; 
`;
export const BoxStyle = styled.div<BoxProps>(getBoxStyle);

export const Box = styled(Absolute)<BoxProps>(getBoxStyle);

export const TitleBox = styled(Box)(
  ({ darkMode }) => `
  line-height: 1.3;
  font-size: 13px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  a,
  a:visited {
    color: ${darkMode ? Colors.GRAY5 : Colors.GRAY2};
  }
`
);

export const Title = styled.div`
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 10px;
`;

export const Description = styled.div`
  max-height: 155px;
  overflow: auto;
`;

export const LegendTitle = styled.div`
  font-weight: bold;
  font-size: 13px;
`;

export const ToastContent = styled.div`
  font-size: 12px;
`;
